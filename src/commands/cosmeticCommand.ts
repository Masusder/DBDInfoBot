import {
    ActionRowBuilder,
    AttachmentBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js';
import { getCosmeticChoices, getCosmeticData, getCosmeticDataById } from '../services/cosmeticService';
import fetchAndResizeImage from "../utils/resizeImage";
import Constants from "../constants";
import axios from "axios";
import { createCanvas, loadImage } from "canvas";

export const data = new SlashCommandBuilder()
    .setName('cosmetic')
    .setDescription('Search for a cosmetic by name')
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('Name of the cosmetic')
            .setAutocomplete(true)
            .setRequired(true)
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    const cosmeticName = interaction.options.getString('name');

    if (!cosmeticName) return;

    await interaction.deferReply();

    const cosmeticData = getCosmeticData(cosmeticName);
    if (cosmeticData) {
        const embedColor: ColorResolvable = Constants.RARITY_COLORS[cosmeticData.Rarity] || Constants.RARITY_COLORS['N/A'];
        const imageUrl = `${Constants.DBDINFO_BASE_URL}${cosmeticData.IconFilePathList}`;
        const resizedImageBuffer = await fetchAndResizeImage(imageUrl, 256, null);

        const attachment = new AttachmentBuilder(resizedImageBuffer, { name: 'resized-image.png' });

        const inclusionVersion: string = cosmeticData.InclusionVersion;
        const inclusionVersionPretty = inclusionVersion === "Legacy" ? "Before 5.5.0" : inclusionVersion;

        const isPurchasable = cosmeticData.Purchasable;

        const releaseDate = cosmeticData.ReleaseDate ? new Date(cosmeticData.ReleaseDate) : null;
        const formattedReleaseDate = releaseDate ? releaseDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'N/A';

        // const cosmeticType = cosmeticData.Type;

        const outfitPieces: string[] = cosmeticData.OutfitItems || [];

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(cosmeticData.CosmeticName)
            .setDescription(cosmeticData.Description)
            .addFields(
                { name: 'Rarity', value: cosmeticData.Rarity || 'N/A', inline: true },
                { name: 'Inclusion Version', value: inclusionVersionPretty || 'N/A', inline: true },
                { name: 'Type', value: cosmeticData.Type || 'N/A', inline: true },
                { name: 'Release Date', value: isPurchasable && formattedReleaseDate || 'N/A', inline: true },
                {
                    name: 'More Info',
                    value: `[Click here](${Constants.DBDINFO_BASE_URL}/store/cosmetics?cosmeticId=${cosmeticData.CosmeticId})`,
                    inline: false
                }
            )
            .setImage('attachment://resized-image.png')
            .setTimestamp()
            .setFooter({ text: 'Cosmetic Information' });

        const viewImagesButton = new ButtonBuilder()
            .setCustomId('view_outfit_pieces')
            .setLabel('View Outfit Pieces')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(outfitPieces.length === 0);

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(viewImagesButton);

        await interaction.editReply({
            embeds: [embed],
            files: [attachment],
            components: outfitPieces.length > 0 ? [actionRow] : [],
        });
    } else {
        await interaction.followUp(`No cosmetic found for "${cosmeticName}".`);
    }
}

// region Cosmetic Utils
export function getCosmeticPiecesImage(cosmeticPieces: string[]) {
    const urls: string[] = [];
    for (const cosmeticPieceId of cosmeticPieces) {
        const cosmeticPieceData = getCosmeticDataById(cosmeticPieceId);

        if (cosmeticPieceData) {
            const imageUrl = `${Constants.DBDINFO_BASE_URL}${cosmeticPieceData.IconFilePathList}`;
            urls.push(imageUrl);
        }
    }

    return urls;
}

export async function combineImages(imageUrls: string[]): Promise<Buffer> {
    const imageBuffers: Buffer[] = await Promise.all(
        imageUrls.map(async (url) => {
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                return Buffer.from(response.data);
            } catch (error) {
                console.error(`Error fetching image from ${url}:`, error);
                throw error;
            }
        })
    );

    const images = await Promise.all(imageBuffers.map(buffer => loadImage(buffer)));

    const totalWidth = images.reduce((sum, img) => sum + img.width, 0);
    const maxHeight = Math.max(...images.map(img => img.height));

    const canvas = createCanvas(totalWidth, maxHeight);
    const ctx = canvas.getContext('2d');

    let currentX = 0;
    for (const img of images) {
        ctx.drawImage(img, currentX, 0);
        currentX += img.width;
    }

    return canvas.toBuffer('image/png');
}

// endregion

export async function autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const choices = getCosmeticChoices(focusedValue);
    const options = choices.slice(0, 25).map(cosmetic => ({
        name: cosmetic.CosmeticName,
        value: cosmetic.CosmeticName
    }));

    await interaction.respond(options);
}