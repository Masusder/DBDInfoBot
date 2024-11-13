import Constants from "../constants";
import * as crypto from 'crypto';
import { getTranslation } from "@utils/localizationUtils";
import { Locale } from "discord.js";

export function extractInteractionId(customId: string): string | null {
    const parts = customId.split('::');
    return parts.length > 1 ? parts[1] : null;
}

export function combineBaseUrlWithPath(relativePath: string): string {
    // Remove any trailing slash from the base URL and any leading slash from the relative path
    const baseUrl = Constants.DBDINFO_BASE_URL.replace(/\/+$/, '');
    const path = relativePath.replace(/^\/+/, '');

    return `${baseUrl}/${path}`;
}

export function formatInclusionVersion(inclusionVersion: string, locale: Locale): string {
    return inclusionVersion === "Legacy" ? getTranslation('legacy', locale, 'general') : inclusionVersion;
}

export function formatHtmlToDiscordMarkdown(html: string): string {
    // Replace <b> with **bold** text (Discord markdown for bold)
    html = html.replace(/<b>(.*?)<\/b>/g, '**$1**');

    // Replace uncommon, rare, very rare classes with bold markdown as Discord doesn't allow color formatting
    html = html.replace(/<span class='uncommon-rarity-color'>(.*?)<\/span>/g, '**$1**');
    html = html.replace(/<span class='rare-rarity-color'>(.*?)<\/span>/g, '**$1**');
    html = html.replace(/<span class='veryrare-rarity-color'>(.*?)<\/span>/g, '**$1**');

    // Replace <span class='slash-dbd-fix'> with `/`
    html = html.replace(/<span class='slash-dbd-fix'>(.*?)<\/span>/g, '$1');

    // Replace <br> tags with newlines (\n) for Discord formatting
    html = html.replace(/<br\s*\/?>/g, '\n');

    // Replace <span class="FlavorText"> with italic text (Discord markdown for italics)
    html = html.replace(/<span class="FlavorText">(.*?)<\/span>/g, '*$1*');

    // Replace <li> with Discord list markdown (- or *) and add a newline after each item
    html = html.replace(/<li>(.*?)<\/li>/g, '- $1\n');

    // Clean up any remaining HTML tags
    html = html.replace(/<\/?[^>]+(>|$)/g, "");

    return html;
}

export function formatNumber(number: number | undefined | null): string {
    if (number === undefined || number === null || isNaN(number)) {
        return "0";
    }

    try {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    } catch (error) {
        console.error("Error formatting number:", error);
        return "0";
    }
}

export function adjustForTimezone(dateString: string): number {
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return date.getTime() - timezoneOffset;
}

export function generateCustomId(input: string) {
    const hash =  crypto.createHash('sha256').update(input).digest('base64');

    return hash.slice(0, 8);
}

export function compareCustomId(input1:string, input2:string): boolean {
    const shortId1 = generateCustomId(input1);
    const shortId2 = generateCustomId(input2);

    return shortId1 === shortId2;
}