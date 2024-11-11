import {
    APIEmbedField,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder
} from 'discord.js';
import {
    getPerkChoices,
    getPerkDataByName
} from "@services/perkService";
import { Role } from "@data/Role";
import { getCharacterDataByIndex } from "@services/characterService";
import {
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown,
} from "@utils/stringUtils";
import { getTranslation } from "@utils/localizationUtils";
import { layerIcons } from "@commands/infoSubCommands/infoUtils";

export async function handlePerkCommandInteraction(interaction: ChatInputCommandInteraction) {
    const perkName = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!perkName) return;

    try {
        await interaction.deferReply();

        const perkData = await getPerkDataByName(perkName, locale);

        if (!perkData) return;

        const role = perkData.Role as 'Survivor' | 'Killer';
        const roleData = Role[role];

        const perkBackgroundUrl = roleData.perkBackground;
        const perkIconUrl = combineBaseUrlWithPath(perkData.IconFilePathList);
        const imageBuffer = await layerIcons(perkBackgroundUrl, perkIconUrl);

        const characterData = await getCharacterDataByIndex(perkData.Character, locale);

        let characterName: string | null = null;
        if (characterData) characterName = characterData.Name;

        const title = characterName ? `${perkName} (${characterName})` : `${perkName} (${getTranslation('info_command.perk_subcommand.generic_perk', locale, 'messages')})`;

        const field: APIEmbedField = {
            name: getTranslation('info_command.perk_subcommand.description', locale, 'messages'),
            value: formatHtmlToDiscordMarkdown(perkData.Description)
        };

        const embed = new EmbedBuilder()
            .setColor(roleData.hexColor)
            .setTitle(title)
            .setFields(field)
            .setTimestamp()
            .setThumbnail(`attachment://perkImage_${perkData.PerkId}.png`)
            .setAuthor({
                name: getTranslation('info_command.perk_subcommand.perk_information', locale, 'messages'),
                iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_perks.png')
            });

        await interaction.editReply({
            embeds: [embed],
            files: [{
                attachment: imageBuffer,
                name: `perkImage_${perkData.PerkId}.png`
            }]
        });
    } catch (error) {
        console.error("Error executing perk subcommand:", error);
    }
}

export async function handlePerkCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getPerkChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(perk => ({
            name: perk.Name,
            value: perk.Name
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}