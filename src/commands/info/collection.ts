import {
    APIEmbedField,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder
} from "discord.js";
import {
    adjustForTimezone,
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown,
    formatInclusionVersion,
    isValidData
} from "@utils/stringUtils";
import {
    getCollectionChoices,
    getCollectionDataById
} from "@services/collectionService";
import { Cosmetic } from "@tps/index";
import { Rarities } from "@data/Rarities";
import { getCachedCosmetics } from "@services/cosmeticService";
import {
    IPaginationOptions,
    paginationHandler
} from "@handlers/paginationHandler";
import { combineImagesIntoGrid } from "@utils/imageUtils";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { generateStoreCustomizationIcons } from "@commands/info/cosmetic/utils";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import logger from "@logger";

// region Interaction Handlers
export async function handleCollectionCommandInteraction(interaction: ChatInputCommandInteraction) {
    const collectionId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!collectionId) return;

    try {
        await interaction.deferReply();

        const [collectionData, cosmeticData] = await Promise.all([
            getCollectionDataById(collectionId, locale),
            getCachedCosmetics(locale)
        ])

        if (!collectionData || !isValidData(cosmeticData)) {
            const message = t('info_command.collection_subcommand.error_retrieving_data', locale, ELocaleNamespace.Errors) + ' ' + t('general.try_again_later', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        const title = t('info_command.collection_subcommand.total_of_cosmetics', locale, ELocaleNamespace.Messages, {
            collection_title: collectionData.CollectionTitle,
            cosmetics_count: collectionData.Items.length.toString()
        })

        const dominantRarity = determineDominantRarity(collectionData.Items, cosmeticData);

        const generateEmbed = async(
            pageItems: string[]
        ): Promise<EmbedBuilder> => {
            const cosmeticFields: APIEmbedField[] = pageItems.map(itemId => {
                const cosmetic = cosmeticData[itemId];
                if (!cosmetic) return null;

                const description = formatHtmlToDiscordMarkdown(cosmetic.Description);
                const formattedAndTruncatedDescription = description.length > 35 ? description.substring(0, 35) + '..' : description;

                return {
                    name: cosmetic.CosmeticName,
                    value: formattedAndTruncatedDescription,
                    inline: true
                };
            }).filter(field => field !== null);

            const updateDatePretty = new Date(adjustForTimezone(collectionData.UpdatedDate)).toLocaleDateString(locale, {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric"
            });

            const description = `${t('list_command.cosmetics_subcommand.more_info', locale, ELocaleNamespace.Messages)}\n\n${t('info_command.collection_subcommand.collection_inclusion_version', locale, ELocaleNamespace.Messages, { inclusion_version: formatInclusionVersion(collectionData.InclusionVersion, locale) })}`;

            const embed = new EmbedBuilder()
                .setColor(Rarities[dominantRarity].color as ColorResolvable)
                .setTitle(title)
                .setDescription(description)
                .setThumbnail(combineBaseUrlWithPath(collectionData.HeroImage))
                .setAuthor({
                    name: t('info_command.collection_subcommand.collection_info', locale, ELocaleNamespace.Messages),
                    iconURL: combineBaseUrlWithPath('/images/UI/Icons/HelpLoading/iconHelpLoading_info.png')
                })
                .addFields(cosmeticFields);

            if (collectionData.UpdatedDate !== '0001-01-01T00:00:00Z') {
                embed.setFooter(
                    {
                        text: t('info_command.collection_subcommand.collection_last_updated', locale, ELocaleNamespace.Messages, {
                            update_date: updateDatePretty
                        })
                    }
                );
            }

            return embed;
        };

        const generateImage = async(pageItems: string[]) => {
            const customizationBuffers = await generateStoreCustomizationIcons(pageItems, cosmeticData) as Buffer[];

            return await combineImagesIntoGrid(customizationBuffers, 5, 10);
        };

        const paginationOptions: IPaginationOptions<string> = {
            items: collectionData.Items,
            itemsPerPage: 9,
            generateEmbed,
            generateImage,
            interactionUserId: interaction.user.id,
            interactionReply: interaction,
            timeout: 60_000,
            locale: locale,
            showPageNumbers: false
        };

        await paginationHandler(paginationOptions);
    } catch (error) {
        logger.error("Error executing collection subcommand:", error);
    }
}

// endregion

// region Autocomplete
export async function handleCollectionCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getCollectionChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(collection => ({
            name: collection.CollectionTitle,
            value: collection.CollectionId
        }));

        await interaction.respond(options);
    } catch (error) {
        logger.error("Error handling autocomplete interaction:", error);
    }
}

// endregion

// region Utils
function determineDominantRarity(collectionCosmetics: string[], cosmeticData: {
    [key: string]: Cosmetic
}): keyof typeof Rarities {
    const rarityCounts: Record<keyof typeof Rarities, number> = Object.keys(Rarities).reduce(
        (acc, rarity) => ({ ...acc, [rarity]: 0 }),
        {} as Record<keyof typeof Rarities, number>
    );

    collectionCosmetics.forEach(cosmeticId => {
        const cosmetic = cosmeticData[cosmeticId];
        if (cosmetic && Rarities[cosmetic.Rarity]) {
            rarityCounts[cosmetic.Rarity]++;
        }
    });

    return Object.entries(rarityCounts).reduce((dominant, [rarity, count]) => {
        return count > rarityCounts[dominant] ? (rarity as keyof typeof Rarities) : dominant;
    }, "Common" as keyof typeof Rarities);
}

// endregion