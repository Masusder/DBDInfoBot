import {
    ButtonInteraction,
    EmbedBuilder,
    MessageFlags
} from 'discord.js';
import { getCachedCosmetics } from '@services/cosmeticService';
import {
    combineBaseUrlWithPath,
    extractInteractionId
} from '@utils/stringUtils';
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from '@tps/enums/ELocaleNamespace';
import {
    combineImagesIntoGrid,
    IStoreCustomizationItem
} from "@utils/imageUtils";
import { Rarities } from "@data/Rarities";
import { Cosmetic } from "@tps/cosmetic";
import {
    isCosmeticLimited,
    isCosmeticOnSale
} from "@commands/info/cosmetic/utils";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import createStoreCustomizationIcons from "@utils/images/createStoreCustomizationIcons";

export async function viewOutfitPiecesHandler(interaction: ButtonInteraction) {
    const cosmeticId = extractInteractionId(interaction.customId);
    const locale = interaction.locale;

    if (!cosmeticId) {
        const message = t('info_command.cosmetic_subcommand.button_interaction.invalid_id', locale, ELocaleNamespace.Errors);
        await sendErrorMessage(interaction, message);
        return;
    }

    const cosmeticsData = await getCachedCosmetics(locale);
    const cosmeticData = cosmeticsData[cosmeticId];

    if (!cosmeticData) {
        const message = t('info_command.cosmetic_subcommand.button_interaction.error_retrieving_data', locale, ELocaleNamespace.Errors)
        await sendErrorMessage(interaction, message);
        return;
    }

    const outfitPieces = await getCosmeticPiecesCombinedImage(cosmeticData.OutfitItems, cosmeticsData);
    const outfitPiecesBuffer = await createStoreCustomizationIcons(outfitPieces) as Buffer[];
    const combinedImageBuffer = await combineImagesIntoGrid(outfitPiecesBuffer);

    const embed = new EmbedBuilder()
        .setTitle(t('info_command.cosmetic_subcommand.button_interaction.outfit_pieces', locale, ELocaleNamespace.Messages, {
            cosmetic_name: cosmeticData.CosmeticName
        }))
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
        flags: MessageFlags.Ephemeral
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
                text: cosmeticPieceData.CosmeticName,
                includeText: false,
                background: Rarities[cosmeticPieceData.Rarity].storeCustomizationPath,
                prefix: cosmeticPieceData.Prefix,
                isLinked: cosmeticPieceData.Unbreakable,
                isLimited: isCosmeticLimited(cosmeticPieceData),
                isOnSale,
                isKillSwitched: !!cosmeticPieceData?.KillSwitched,
                color: Rarities[cosmeticPieceData.Rarity].color
            };

            imageSources.push(model);
        }
    }

    return imageSources;
}