import Constants from "../constants";

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

export function formatInclusionVersion(inclusionVersion: string): string {
    return inclusionVersion === "Legacy" ? "Before 5.5.0" : inclusionVersion;
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