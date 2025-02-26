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
import { t } from "@utils/localizationUtils";
import {
    getCharacterChoices,
    getCharacterDataByIndex,
} from "@services/characterService";
import { Difficulties } from "@data/Difficulties";
import { Genders } from "@data/Genders";
import {
    fetchAndResizeImage,
    layerIcons
} from "@utils/imageUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { getOrCreateMultiplePerkEmojis } from "@utils/emojiManager";
import { getPerksByCharacterIndex } from "@services/perkService";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import logger from "@logger";

// region Interaction Handlers
export async function handleCharacterCommandInteraction(interaction: ChatInputCommandInteraction) {
    const characterIndex = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!characterIndex) return;

    try {
        await interaction.deferReply();

        const characterData = await getCharacterDataByIndex(characterIndex, locale);

        if (!characterData) {
            const message = t('info_command.character_subcommand.error_retrieving_data', locale, ELocaleNamespace.Errors) + ' ' + t('general.try_again_later', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        const role = characterData.Role as 'Killer' | 'Survivor';
        const roleData = Role[role];

        const characterBackgroundUrl = roleData.charPortrait;
        const characterIconUrl = combineBaseUrlWithPath(characterData.IconFilePath);
        const imageBuffer = await layerIcons(characterBackgroundUrl, characterIconUrl) as Buffer;

        const fields: APIEmbedField[] = [];

        const difficulty = characterData.Difficulty;

        if (difficulty !== "None") {
            fields.push({
                name: t('info_command.character_subcommand.difficulty', locale, ELocaleNamespace.Messages),
                value: t(Difficulties[difficulty], locale, ELocaleNamespace.General),
                inline: true
            });
        }

        const perks = await getPerksByCharacterIndex(characterData.CharacterIndex, locale);
        const perkEmojis = await getOrCreateMultiplePerkEmojis(Object.keys(perks), locale);

        fields.push(
            {
                name: t('info_command.character_subcommand.role', locale, ELocaleNamespace.Messages),
                value: t(roleData.localizedName, locale, ELocaleNamespace.General),
                inline: true
            },
            {
                name: t('info_command.character_subcommand.gender', locale, ELocaleNamespace.Messages),
                value: t(Genders[characterData.Gender], locale, ELocaleNamespace.General),
                inline: true
            },
            {
                name: t('info_command.character_subcommand.description', locale, ELocaleNamespace.Messages),
                value: formatHtmlToDiscordMarkdown(characterData.Biography),
                inline: false
            },
            {
                name: t('info_command.character_subcommand.perks', locale, ELocaleNamespace.Messages),
                value: perkEmojis
                    .map(emoji => {
                        if (emoji.name && perks[emoji.name]) {
                            return `<:${emoji.name}:${emoji.id}> ${perks[emoji.name].Name}`;
                        }
                        return '';
                    })
                    .join('\n'),
                inline: false
            }
        );

        const resizedCharacterBackgroundBuffer = await fetchAndResizeImage(combineBaseUrlWithPath(characterData.BackgroundImagePath), null, 160);

        const embed = new EmbedBuilder()
            .setColor(roleData.hexColor)
            .setTitle(characterData.Name)
            .setFields(fields)
            .setTimestamp()
            .setThumbnail(`attachment://characterImage_${characterData.CharacterIndex}.png`)
            .setAuthor({
                name: t('info_command.character_subcommand.character_information', locale, ELocaleNamespace.Messages),
                iconURL: role === 'Survivor' ? combineBaseUrlWithPath('/images/UI/Icons/Help/help_levelIcon_survivor.png') : combineBaseUrlWithPath('/images/UI/Icons/Help/help_levelIcon_killer.png')
            })
            .setImage(`attachment://characterBackground_${characterData.CharacterIndex}.png`);

        const backstoryButton = new ButtonBuilder()
            .setCustomId(`show_character_backstory::${characterData.CharacterIndex}::${interaction.user.id}`)
            .setLabel(t('info_command.character_subcommand.read_backstory', locale, ELocaleNamespace.Messages))
            .setStyle(ButtonStyle.Primary);

        const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(backstoryButton);

        if (characterData.Hints.length > 0) {
            const hintsButton = new ButtonBuilder()
                .setCustomId(`show_character_hints::${characterData.CharacterIndex}::${interaction.user.id}`)
                .setLabel(t('info_command.character_subcommand.check_hints', locale, ELocaleNamespace.Messages))
                .setStyle(ButtonStyle.Secondary);

            buttons.addComponents(hintsButton);
        }

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
            components: [buttons]
        });
    } catch (error) {
        logger.error("Error executing character subcommand:", error);
    }
}

// endregion

// region Autocomplete
export async function handleCharacterCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getCharacterChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(character => ({
            name: character.Name,
            value: character.CharacterIndex as string
        }));

        await interaction.respond(options);
    } catch (error) {
        logger.error("Error handling autocomplete interaction:", error);
    }
}

// endregion