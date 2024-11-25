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
    formatInclusionVersion
} from "@utils/stringUtils";
import {
    getCollectionChoices,
    getCollectionDataById
} from "@services/collectionService";
import { Cosmetic } from "../../types";
import { Rarities } from "@data/Rarities";
import { getCachedCosmetics } from "@services/cosmeticService";
import {
    genericPaginationHandler,
    IPaginationOptions
} from "@handlers/genericPaginationHandler";
import { combineImagesIntoGrid } from "@utils/imageUtils";
import { getTranslation } from "@utils/localizationUtils";

export async function handleCollectionCommandInteraction(interaction: ChatInputCommandInteraction) {
    const collectionId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!collectionId) return;

    try {
        await interaction.deferReply();

        const collectionData = await getCollectionDataById(collectionId, locale);
        const cosmeticData = await getCachedCosmetics(locale);

        if (!collectionData || !cosmeticData) {
            const message = getTranslation('info_command.collection_subcommand.error_retrieving_data', locale, 'errors')
            await interaction.editReply({ content: message });
            return;
        }

        const title = `${collectionData.CollectionTitle} (${getTranslation('info_command.collection_subcommand.total_of_cosmetics.0', locale, 'messages')} ${collectionData.Items.length} ${getTranslation('info_command.collection_subcommand.total_of_cosmetics.1', locale, 'messages')})`
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
                    inline: true,
                };
            }).filter(field => field !== null)

            const updateDatePretty = new Date(adjustForTimezone(collectionData.UpdatedDate)).toLocaleDateString(locale, {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric"
            });

            const description = `${getTranslation('list_command.cosmetics_subcommand.more_info.0', locale, 'messages')}: \`/${getTranslation('list_command.cosmetics_subcommand.more_info.1', locale, 'messages')}\`\n\n${getTranslation('info_command.collection_subcommand.collection_inclusion_version', locale, 'messages')} ${formatInclusionVersion(collectionData.InclusionVersion, locale)}`;

            return new EmbedBuilder()
                .setColor(Rarities[dominantRarity].color as ColorResolvable)
                .setTitle(title)
                .setDescription(description)
                .setThumbnail(combineBaseUrlWithPath(collectionData.HeroImage))
                .setAuthor({
                    name: getTranslation('info_command.collection_subcommand.collection_info', locale, 'messages'),
                    iconURL: combineBaseUrlWithPath('/images/UI/Icons/HelpLoading/iconHelpLoading_info.png'),
                })
                .addFields(cosmeticFields)
                .setFooter({ text: `${getTranslation('info_command.collection_subcommand.collection_last_updated', locale, 'messages')} ${updateDatePretty}` });
        }

        const generateImage = async(pageItems: string[]) => {
            const imageUrls: string[] = [];
            pageItems.forEach((cosmeticId: string) => {
                imageUrls.push(combineBaseUrlWithPath(cosmeticData[cosmeticId].IconFilePathList));
            });

            return await combineImagesIntoGrid(imageUrls, 3, 3);
        };

        const paginationOptions: IPaginationOptions = {
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

        await genericPaginationHandler(paginationOptions);
    } catch (error) {
        console.error("Error executing collection subcommand:", error);
    }
}

// region Utils
function determineDominantRarity(collectionCosmetics: string[], cosmeticData: {[key:string]: Cosmetic}): keyof typeof Rarities {
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
        console.error("Error handling autocomplete interaction:", error);
    }
}