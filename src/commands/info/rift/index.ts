import { ThemeColors } from "@constants/themeColors";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import { paginationHandler } from "@handlers/paginationHandler";
import { getCachedCosmetics } from "@services/cosmeticService";
import {
    getRiftChoices,
    getRiftDataById
} from "@services/riftService";
import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder
} from "discord.js";
import {
    chunkArray,
    constructDescription
} from "./utils/riftUtils";
import { generateRiftTemplate } from "./utils/riftTemplate";
import { isValidData } from "@utils/stringUtils";
import { getTranslation } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

// region Interaction Handlers
const TIERS_PER_PAGE = 8;
export const AC_CURRENCY_PACKS = ["cellsPack_25", "cellsPack_50", "cellsPack_75"];

export async function handleRiftCommandInteraction(interaction: ChatInputCommandInteraction) {
    const riftId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!riftId) return;

    try {
        await interaction.deferReply();

        const [riftData, cosmeticData] = await Promise.all([
            getRiftDataById(riftId, locale),
            getCachedCosmetics(locale)
        ]);

        if (!riftData || !isValidData(cosmeticData)) {
            const message = getTranslation('info_command.rift_subcommand.error_retrieving_data', locale, ELocaleNamespace.Errors) + ' ' + getTranslation('general.try_again_later', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        const tiersDivided = chunkArray(riftData.TierInfo, TIERS_PER_PAGE);

        const description = await constructDescription(riftData, locale);

        const generateEmbed = () => {
            return new EmbedBuilder()
                .setTitle(riftData.Name)
                .setDescription(description)
                .setColor(ThemeColors.PRIMARY)
                .setImage(`attachment://riftImage_${riftId}.png`)
                .setTimestamp()
        }

        const generateImage = async(_: any, currentPage: number) => {
            return await generateRiftTemplate(tiersDivided, cosmeticData, currentPage)
        }

        const generateAdditionalButtons = (currentPage: number) => {
            const tiersChunk = tiersDivided[currentPage - 1];
            const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];
            let currentActionRow = new ActionRowBuilder<ButtonBuilder>();

            tiersChunk.forEach((tierInfo, index) => {
                let cosmeticIds: string[] = [];

                ["Free", "Premium"].forEach((type) => {
                    if (currentActionRow.components.length === 5) {
                        actionRows.push(currentActionRow);
                        currentActionRow = new ActionRowBuilder<ButtonBuilder>();
                    }

                    const tierInfoItem = tierInfo[type as 'Free' | 'Premium'];
                    if (tierInfoItem) {
                        tierInfoItem.forEach((tierInfoItem) => {
                            if (tierInfoItem.Type === "inventory" && !AC_CURRENCY_PACKS.includes(tierInfoItem.Id)) {
                                cosmeticIds.push(tierInfoItem.Id);
                            }
                        })
                    }
                });

                currentActionRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`rift_tier::${cosmeticIds.join(",")}::${index}`)
                        .setLabel(`${getTranslation('info_command.rift_subcommand.tier', locale, ELocaleNamespace.Messages)} ${tierInfo.TierId}`)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(cosmeticIds.length === 0)
                );
            });

            if (currentActionRow.components.length > 0) {
                actionRows.push(currentActionRow);
            }

            return actionRows;
        };

        await paginationHandler({
            items: tiersDivided,
            itemsPerPage: 1,
            generateEmbed,
            generateImage,
            interactionUserId: interaction.user.id,
            interactionReply: interaction,
            locale,
            timeout: 120_000,
            generateAdditionalButtons
        });
    } catch (error) {
        console.error("Error executing rift subcommand:", error);
    }
}

// endregion

// region Autocomplete
export async function handleRiftCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getRiftChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(rift => ({
            name: rift.Name,
            value: rift.RiftId
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}

// endregion