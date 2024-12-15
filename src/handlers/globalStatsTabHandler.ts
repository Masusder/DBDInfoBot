import { ButtonInteraction } from "discord.js";
import { extractMultipleInteractionIds } from "@utils/stringUtils";
import { getTranslation } from "@utils/localizationUtils";
import {
    getTabById,
    GlobalStatTabs,
    setActiveTab
} from "@data/GlobalStatTabs";
import {
    createGlobalStatsEmbed,
    createTabButtons
} from "@commands/statsSubCommands/globalStats";
import { getCachedGlobalStats } from "@services/statsService";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import { sendUnauthorizedMessage } from "@handlers/unauthorizedHandler";

export async function globalStatsTabHandler(interaction: ButtonInteraction) {
    const [tabId, userId] = extractMultipleInteractionIds(interaction.customId);
    const locale = interaction.locale;

    if (userId !== interaction.user.id) {
        await sendUnauthorizedMessage(interaction);
        return;
    }

    if (!tabId) {
        const message = getTranslation('stats_command.invalid_tab_id', locale, ELocaleNamespace.Errors);
        await sendErrorMessage(interaction, message);
        return;
    }

    const globalStatTabs = setActiveTab(GlobalStatTabs, tabId);
    const activeTab = getTabById(globalStatTabs, tabId);

    const globalStatsData = await getCachedGlobalStats();

    if (!globalStatsData || Object.keys(globalStatsData).length === 0) {
        const message = getTranslation('stats_command.failed_to_fetch_global_stats', locale, ELocaleNamespace.Errors);
        await sendErrorMessage(interaction, message);
        return;
    }

    const { statsSchema, globalStats } = globalStatsData;

    const embeds = createGlobalStatsEmbed(statsSchema, globalStats, activeTab, locale);

    const buttonRows = createTabButtons(globalStatTabs, locale, interaction);

    await interaction.editReply({
        embeds: embeds,
        components: buttonRows
    });
}