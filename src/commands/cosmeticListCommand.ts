import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";
import {
    getCharacterChoices,
    getCharacterDataByIndex,
    getCharacterIndexByName
} from "@services/characterService";
import { getCosmeticListByCharacterIndex } from "@services/cosmeticService";
import {
    combineBaseUrlWithPath,
    formatInclusionVersion
} from "@utils/stringUtils";
import { CosmeticTypes } from "../data";
import { paginationHandler } from "../handlers/paginationHandler";

const COSMETICS_PER_PAGE = 6;

export const data = new SlashCommandBuilder()
    .setName('cosmetics')
    .setDescription('Check list of cosmetics for specific character')
    .addStringOption(option =>
        option
            .setName('character')
            .setDescription('Name of the character')
            .setAutocomplete(true)
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const characterName = interaction.options.getString('character');
    const locale = interaction.locale;

    if (!characterName) return;

    try {
        await interaction.deferReply();

        const characterIndex = await getCharacterIndexByName(characterName, locale);

        if (!characterIndex) {
            await interaction.editReply({ content: 'Character not found.' });
            return;
        }

        const cosmetics = await getCosmeticListByCharacterIndex(characterIndex, locale);
        if (cosmetics.length === 0) {
            await interaction.editReply({ content: 'No cosmetics found for this character.' });
            return;
        }

        const characterData = await getCharacterDataByIndex(characterIndex, locale);

        if (!characterData) return;

        const generateEmbed = (pageItems: any[]) => {
            const embed = new EmbedBuilder()
                .setTitle(`Cosmetics for ${characterName} (${cosmetics.length} Total)`)
                .setColor("#1e90ff")
                .setFooter({ text: `List of cosmetics` })
                .setTimestamp()
                .setThumbnail(combineBaseUrlWithPath(characterData.IconFilePath));

            pageItems.forEach(cosmetic => {
                const cosmeticDescription = cosmetic.Description.length > 45 ? cosmetic.Description.substring(0, 45) + '..' : cosmetic.Description;
                const description = `${cosmeticDescription}\n\nInclusion Version: **${formatInclusionVersion(cosmetic.InclusionVersion, locale)}**\nType: **${CosmeticTypes[cosmetic.Type]}**`;

                embed.addFields({
                    name: cosmetic.CosmeticName,
                    value: description,
                    inline: true
                });
            });

            return embed;
        };

        await paginationHandler({
            items: cosmetics,
            itemsPerPage: COSMETICS_PER_PAGE,
            generateEmbed,
            interactionUserId: interaction.user.id,
            interactionReply: await interaction.editReply({ content: `For more information about a specific cosmetic, use the command: \`/cosmetic <cosmetic_name>\`` })
        });
    } catch (error: any) {
        console.error("Error executing cosmetic list command:", error);
    }
}

// region Autocomplete
export async function autocomplete(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused();
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

// endregion