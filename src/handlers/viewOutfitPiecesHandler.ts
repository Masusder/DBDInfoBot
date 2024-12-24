import {
    ButtonInteraction,
    EmbedBuilder
} from 'discord.js';
import { getCachedCosmetics } from '@services/cosmeticService';
import {
    combineBaseUrlWithPath,
    extractInteractionId
} from '@utils/stringUtils';
import { getTranslation } from "@utils/localizationUtils";
import { ELocaleNamespace } from '@tps/enums/ELocaleNamespace';
import {
    combineImagesIntoGrid,
    createStoreCustomizationIcons,
    IStoreCustomizationItem
} from "@utils/imageUtils";
import { Rarities } from "@data/Rarities";
import { Cosmetic } from "@tps/cosmetic";
import {
    hasLimitedAvailabilityEnded,
    isCosmeticLimited,
    isCosmeticOnSale
} from "@commands/infoSubCommands/cosmetic";

export async function viewOutfitPiecesHandler(interaction: ButtonInteraction) {
    const cosmeticId = extractInteractionId(interaction.customId);
    const locale = interaction.locale;

    if (!cosmeticId) {
        await interaction.followUp({
            content: getTranslation('info_command.cosmetic_subcommand.button_interaction.invalid_id', locale, ELocaleNamespace.Errors),
            ephemeral: true
        });
        return;
    }

    const cosmeticsData = await getCachedCosmetics(locale);
    const cosmeticData = cosmeticsData[cosmeticId];

    if (!cosmeticData) {
        await interaction.followUp({
            content: getTranslation('info_command.cosmetic_subcommand.button_interaction.error_retrieving_data', locale, ELocaleNamespace.Errors),
            ephemeral: true
        });
        return;
    }

    const outfitPieces = await getCosmeticPiecesCombinedImage(cosmeticData.OutfitItems, cosmeticsData);
    const outfitPiecesBuffer = await createStoreCustomizationIcons(outfitPieces) as Buffer[];
    const combinedImageBuffer = await combineImagesIntoGrid(outfitPiecesBuffer);

    const embed = new EmbedBuilder()
        .setTitle(`${getTranslation('info_command.cosmetic_subcommand.button_interaction.outfit_pieces', locale, ELocaleNamespace.Messages)} ${cosmeticData.CosmeticName}`)
        .setColor(interaction.message.embeds[0].color)
        .setImage('attachment://combined-outfit-pieces.png');

    for (const pieceId of cosmeticData.OutfitItems) {
        const pieceData = cosmeticsData[pieceId];
        if (pieceData) {
            embed.addFields({
                name: pieceData.CosmeticName,
                value: pieceData.Description,
                inline: true
            });
        }
    }

    await interaction.followUp({
        embeds: [embed],
        files: [{ attachment: combinedImageBuffer, name: 'combined-outfit-pieces.png' }],
        ephemeral: true
    });
}

async function getCosmeticPiecesCombinedImage(cosmeticPieces: string[], cosmeticsData: Record<string, Cosmetic>) {
    const imageSources: IStoreCustomizationItem[] = [];
    for (const cosmeticPieceId of cosmeticPieces) {
        const cosmeticPieceData = cosmeticsData[cosmeticPieceId];
        const { isOnSale } = isCosmeticOnSale(cosmeticPieceData);

        if (cosmeticPieceData) {
            const model: IStoreCustomizationItem = {
                icon: combineBaseUrlWithPath(cosmeticPieceData.IconFilePathList),
                background: Rarities[cosmeticPieceData.Rarity].storeCustomizationPath,
                prefix: cosmeticPieceData.Prefix,
                isLinked: cosmeticPieceData.Unbreakable,
                isLimited: isCosmeticLimited(cosmeticPieceData),
                isOnSale
            };

            imageSources.push(model);
        }
    }

    return imageSources;
}