import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { getCharacterChoices, getCharacterDataByIndex, getCharacterIndexByName } from "../services/characterService";
import { getCosmeticListByCharacterIndex } from "../services/cosmeticService";
import { combineBaseUrlWithPath, formatInclusionVersion } from "../utils/stringUtils";
import { CosmeticTypes } from "../data";

const COSMETICS_PER_PAGE = 6;

export const data = new SlashCommandBuilder()
    .setName('cosmetic_list')
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

    if (!characterName) return;

    try {
        await interaction.deferReply();

        const characterIndex = await getCharacterIndexByName(characterName);

        if (!characterIndex) {
            await interaction.editReply({ content: 'Character not found.' });
            return;
        }

        const cosmetics = await getCosmeticListByCharacterIndex(characterIndex);
        if (cosmetics.length === 0) {
            await interaction.editReply({ content: 'No cosmetics found for this character.' });
            return;
        }

        let currentPage = 1;
        const totalPages = Math.ceil(cosmetics.length / COSMETICS_PER_PAGE);

        const getCosmeticPage = (page: number) => {
            const start = (page - 1) * COSMETICS_PER_PAGE;
            const end = start + COSMETICS_PER_PAGE;
            return cosmetics.slice(start, end);
        };

        const characterData = await getCharacterDataByIndex(characterIndex);

        if (!characterData) return;

        const generateEmbed = (page: number) => {
            const pageCosmetics = getCosmeticPage(page);
            const embed = new EmbedBuilder()
                .setTitle(`Cosmetics for ${characterName}`)
                .setColor("#1e90ff")
                .setFooter({ text: `List of cosmetics` })
                .setTimestamp()
                .setThumbnail(combineBaseUrlWithPath(characterData.IconFilePath));

            pageCosmetics.forEach(cosmetic => {
                const cosmeticDescription = cosmetic.Description.length > 45 ? cosmetic.Description.substring(0, 45) + '..' : cosmetic.Description;
                const description = `${cosmeticDescription}\n\nInclusion Version: **${formatInclusionVersion(cosmetic.InclusionVersion)}**\nType: **${CosmeticTypes[cosmetic.Type]}**`;

                embed.addFields({
                    name: cosmetic.CosmeticName,
                    value: description,
                    inline: true,
                });
            });

            return embed;
        };

        const generateButtons = (page: number, totalPages: number) => {
            return new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('pagination::first')
                        .setLabel('First')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 1),
                    new ButtonBuilder()
                        .setCustomId('pagination::previous')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 1),
                    new ButtonBuilder()
                        .setCustomId(`pagination::current::${page}::${totalPages}`)
                        .setLabel(`Page ${page} of ${totalPages}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('pagination::next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === totalPages),
                    new ButtonBuilder()
                        .setCustomId('pagination::last')
                        .setLabel('Last')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages)
                );
        };

        const message = await interaction.editReply({
            embeds: [generateEmbed(currentPage)],
            components: [generateButtons(currentPage, totalPages)],
            content: `For more information about a specific cosmetic, use the command: \`/cosmetic <cosmetic_name>\``,
        });

        const collector = message.createMessageComponentCollector({
            filter: (i): i is ButtonInteraction => i.isButton() && i.user.id === interaction.user.id,
            time: 60000,
        });

        collector.on('collect', async (i: ButtonInteraction) => {
            const [action, paginationType, pageStr] = i.customId.split('::');

            let newPage = currentPage;

            if (action === 'pagination') {
                if (paginationType === 'first') newPage = 1;
                else if (paginationType === 'previous') newPage = Math.max(1, currentPage - 1);
                else if (paginationType === 'next') newPage = Math.min(totalPages, currentPage + 1);
                else if (paginationType === 'last') newPage = totalPages;
                else if (paginationType === 'current') newPage = Number(pageStr);

                currentPage = newPage;

                await i.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [generateButtons(currentPage, totalPages)],
                });
            }
        });

        collector.on('end', async () => {
            await interaction.editReply({ components: [] });
        });
    } catch (error: any) {
        console.error("Error executing cosmetic list command:", error);
    }
}

// Autocomplete function
export async function autocomplete(interaction: AutocompleteInteraction) {
    try {
        const focusedValue = interaction.options.getFocused();
        const choices = await getCharacterChoices(focusedValue);
        const options = choices.slice(0, 25).map(character => ({
            name: character.Name,
            value: character.Name
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}