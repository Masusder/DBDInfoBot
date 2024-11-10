import {
    ActionRowBuilder,
    APIEmbedField,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder
} from "discord.js";
import { Role } from "@data/Role";
import {
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown
} from "@utils/stringUtils";
import { getTranslation } from "@utils/localizationUtils";
import { layerIcons } from "@commands/infoSubCommands/infoUtils";
import {
    getCharacterChoices,
    getCharacterDataByName
} from "@services/characterService";
import { Difficulties } from "@data/Difficulties";
import { Genders } from "@data/Genders";
import {
    fetchAndResizeImage
} from "@utils/imageUtils";

export async function handleCharacterCommandInteraction(interaction: ChatInputCommandInteraction) {
    const characterName = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!characterName) return;

    try {
        await interaction.deferReply();

        const characterData = await getCharacterDataByName(characterName, locale);

        if (!characterData) return;

        const role = characterData.Role as 'Killer' | 'Survivor';
        const roleData = Role[role];

        const characterBackgroundUrl = roleData.charPortrait;
        const characterIconUrl = combineBaseUrlWithPath(characterData.IconFilePath);
        const imageBuffer = await layerIcons(characterBackgroundUrl, characterIconUrl);

        const fields: APIEmbedField[] = [];

        const difficulty = characterData.Difficulty;

        if (difficulty !== "None") {
            fields.push({
                name: getTranslation('info_command.character_subcommand.difficulty', locale, 'messages'),
                value: getTranslation(Difficulties[difficulty], locale, 'general'),
                inline: true
            });
        }

        fields.push(
            {
                name: getTranslation('info_command.character_subcommand.role', locale, 'messages'),
                value: getTranslation(roleData.localizedName, locale, 'general'),
                inline: true
            },
            {
                name: getTranslation('info_command.character_subcommand.gender', locale, 'messages'),
                value: getTranslation(Genders[characterData.Gender], locale, 'general'),
                inline: true
            },
            {
                name: getTranslation('info_command.character_subcommand.description', locale, 'messages'),
                value: formatHtmlToDiscordMarkdown(characterData.Biography),
                inline: false
            }
        );

        const resizedCharacterBackgroundBuffer = await fetchAndResizeImage(combineBaseUrlWithPath(characterData.BackgroundImagePath), null, 160);

        const embed = new EmbedBuilder()
            .setColor(roleData.hexColor)
            .setTitle(characterName)
            .setFields(fields)
            .setTimestamp()
            .setThumbnail(`attachment://characterImage_${characterData.CharacterIndex}.png`)
            .setAuthor({
                name: getTranslation('info_command.character_subcommand.character_information', locale, 'messages'),
                iconURL: role === 'Survivor' ? combineBaseUrlWithPath('/images/UI/Icons/Help/help_levelIcon_survivor.png') : combineBaseUrlWithPath('/images/UI/Icons/Help/help_levelIcon_killer.png')
            })
            .setImage(`attachment://characterBackground_${characterData.CharacterIndex}.png`);

        const backstoryButton = new ButtonBuilder()
            .setCustomId(`show_character_backstory::${characterData.CharacterIndex}`)
            .setLabel(getTranslation('info_command.character_subcommand.read_backstory', locale, 'messages'))
            .setStyle(ButtonStyle.Primary);

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backstoryButton);

        await interaction.editReply({
            embeds: [embed],
            files: [
                {
                    attachment: imageBuffer,
                    name: `characterImage_${characterData.CharacterIndex}.png`
                },
                {
                    attachment: resizedCharacterBackgroundBuffer,
                    name: `characterBackground_${characterData.CharacterIndex}.png`
                }
            ],
            components: [actionRow]
        });
    } catch (error) {
        console.error("Error executing character subcommand:", error);
    }
}

export async function handleCharacterCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getCharacterChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(character => ({
            name: character.Name,
            value: character.Name
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}