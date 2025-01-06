import { AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder, Locale } from "discord.js";
import { getCachedRifts, getRiftChoices } from "@services/riftService";
import { getTranslation } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { adjustForTimezone } from "@utils/stringUtils";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import { Rift, TierInfo } from "@tps/rift";
import { Currencies } from "@data/Currencies";
import { createEmojiMarkdown, getApplicationEmoji } from "@utils/emojiManager";
import { ThemeColors } from "@constants/themeColors";
import { generateRiftTemplate } from "@utils/images/riftTemplate";
import { getCachedCosmetics } from "@services/cosmeticService";
import { genericPaginationHandler } from "@handlers/genericPaginationHandler";

// region Command Interactions
const TIERS_PER_PAGE = 8;
export async function handleRiftCommandInteraction(interaction: ChatInputCommandInteraction) {
    const riftId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!riftId) return;

    try {
        await interaction.deferReply();

        const [riftData, cosmeticData] = await Promise.all([
            getCachedRifts(locale),
            getCachedCosmetics(locale)
        ]);

        if (!riftData || !cosmeticData || Object.keys(riftData).length === 0 || Object.keys(cosmeticData).length === 0) {
            await sendErrorMessage(interaction, "Failed to retrieve rifts.", false); // TODO: localize
            return;
        }

        const rift = riftData[riftId];
        const tiersDivided = chunkArray(rift.TierInfo, TIERS_PER_PAGE);

        const description = await constructDescription(rift, locale);

        const generateEmbed = () => {
            return new EmbedBuilder()
                .setTitle(rift.Name)
                .setDescription(description)
                .setColor(ThemeColors.PRIMARY)
                .setImage(`attachment://riftImage_${riftId}.png`)
                .setTimestamp()
        }

        const generateImage = async(_: any, currentPage: number) => {
            return await generateRiftTemplate(tiersDivided, cosmeticData, currentPage)
        }

        await genericPaginationHandler({
            items: tiersDivided,
            itemsPerPage: 1,
            generateEmbed,
            generateImage,
            interactionUserId: interaction.user.id,
            interactionReply: interaction,
            locale,
            timeout: 120_000
        });
    } catch (error) {
        console.error("Error executing rift subcommand:", error);
    }
}

// endregion

// region Utils
async function constructDescription(riftData: Rift, locale: Locale): Promise<string> {
    const adjustedEndDate = Math.floor(adjustForTimezone(riftData.EndDate) / 1000);
    const adjustedStartDate = Math.floor(adjustForTimezone(riftData.StartDate) / 1000);

    const riftFragmentData = Currencies["RiftFragments"];
    const riftFragmentEmoji = await getApplicationEmoji(riftFragmentData.emojiId)
    const riftFragmentEmojiMarkdown = riftFragmentEmoji ? createEmojiMarkdown(riftFragmentEmoji) : '';

    return `Rift ends in: <t:${adjustedEndDate}:R>\nRift is active from <t:${adjustedStartDate}> to <t:${adjustedEndDate}>\n\n To progress by one tier you need to earn: **${riftData.Requirement} ${getTranslation(riftFragmentData.localizedName, locale, ELocaleNamespace.General)}** ${riftFragmentEmojiMarkdown}`;  // TODO: localize
}

function chunkArray(arr: TierInfo[], size: number) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
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