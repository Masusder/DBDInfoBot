import {
    APIEmbedField,
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags
} from 'discord.js';
import {
    getPerkChoices,
    getPerkDataById
} from "@services/perkService";
import { Role } from "@data/Role";
import { getCharacterDataByIndex } from "@services/characterService";
import {
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown,
} from "@utils/stringUtils";
import { getTranslation } from "@utils/localizationUtils";
import { layerIcons } from "@utils/imageUtils";
import { ELocaleNamespace } from '@tps/enums/ELocaleNamespace';

// region Interaction Handlers
export async function handlePerkCommandInteraction(interaction: ChatInputCommandInteraction | ButtonInteraction) {
    const perkId = interaction instanceof ButtonInteraction ? interaction.customId.split("::")[1] : interaction.options.getString('name');
    const locale = interaction.locale;

    if (!perkId) return;

    try {
        if (!(interaction instanceof ButtonInteraction)) { // TODO: split into two handlers
            await interaction.deferReply();
        }

        const perkData = await getPerkDataById(perkId, locale);

        if (!perkData) return; // TODO: respond with message

        const role = perkData.Role as 'Survivor' | 'Killer';
        const roleData = Role[role];

        const perkBackgroundUrl = roleData.perkBackground;
        const perkIconUrl = combineBaseUrlWithPath(perkData.IconFilePathList);
        const imageBuffer = await layerIcons(perkBackgroundUrl, perkIconUrl) as Buffer;

        const characterData = await getCharacterDataByIndex(perkData.Character, locale);

        let characterName: string | null = null;
        if (characterData) characterName = characterData.Name;

        const perkName = perkData.Name;
        const title = characterName ? `${perkName} (${characterName})` : `${perkName} (${getTranslation('info_command.perk_subcommand.generic_perk', locale, ELocaleNamespace.Messages)})`;

        const field: APIEmbedField = {
            name: getTranslation('info_command.perk_subcommand.description', locale, ELocaleNamespace.Messages),
            value: formatHtmlToDiscordMarkdown(perkData.Description)
        };

        const embed = new EmbedBuilder()
            .setColor(roleData.hexColor)
            .setTitle(title)
            .setFields(field)
            .setTimestamp()
            .setThumbnail(`attachment://perkImage_${perkData.PerkId}.png`)
            .setAuthor({
                name: getTranslation('info_command.perk_subcommand.perk_information', locale, ELocaleNamespace.Messages),
                iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_perks.png')
            });

        if (interaction instanceof ButtonInteraction) {
            await interaction.followUp({
                embeds: [embed],
                files: [{
                    attachment: imageBuffer,
                    name: `perkImage_${perkData.PerkId}.png`
                }],
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.editReply({
                embeds: [embed],
                files: [{
                    attachment: imageBuffer,
                    name: `perkImage_${perkData.PerkId}.png`
                }]
            });
        }
    } catch (error) {
        console.error("Error executing perk subcommand:", error);
    }
}

// endregion

// region Autocomplete
export async function handlePerkCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getPerkChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(perk => ({
            name: perk.Name,
            value: perk.PerkId
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}

// endregion