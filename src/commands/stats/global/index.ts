import { ChatInputCommandInteraction, } from "discord.js";
import { getTranslation } from "@utils/localizationUtils";
import { getCachedGlobalStats } from "@services/statsService";
import { GlobalStatTabs, } from "@data/GlobalStatTabs";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import {
    createGlobalStatsEmbed,
    createTabButtons
} from "./utils";

export async function handleGlobalStatsCommandInteraction(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale;

    try {
        await interaction.deferReply();
        const globalStatsData = await getCachedGlobalStats();

        if (!globalStatsData || Object.keys(globalStatsData).length === 0) {
            const message = getTranslation('stats_command.failed_to_fetch_global_stats', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        const { statsSchema, globalStats } = globalStatsData;

        const buttonRows = createTabButtons(GlobalStatTabs, locale, interaction);

        const embeds = createGlobalStatsEmbed(statsSchema, globalStats, GlobalStatTabs[1], locale);

        await interaction.editReply({
            embeds: embeds,
            components: buttonRows
        });
    } catch (error) {
        console.error("Error executing global stats subcommand:", error);
    }
}