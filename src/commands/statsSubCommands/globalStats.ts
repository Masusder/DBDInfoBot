import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale
} from "discord.js";
import { getTranslation } from "@utils/localizationUtils";
import {
    combineBaseUrlWithPath,
    formatNumber
} from "@utils/stringUtils";
import { getCachedGlobalStats } from "@services/statsService";
import {
    GlobalStatTabs,
    IGlobalStatTab
} from "@data/GlobalStatTabs";
import { IStatsSchema } from "@ui/types/playerStats";
import Constants from "../../constants";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { sendErrorMessage } from "@handlers/errorResponseHandler";

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

// region Utils
export function createGlobalStatsEmbed(
    statsSchema: IStatsSchema,
    globalStats: { [key: string]: string | number },
    activeTab: IGlobalStatTab,
    locale: Locale
): EmbedBuilder[] {
    const embeds: EmbedBuilder[] = [];
    const fields: { name: string; value: string; inline: boolean }[] = [];


    const activeStatsSchema = statsSchema[activeTab.id];
    const playerCount = formatNumber(globalStats.rowCount as number);

    const iconPaths = Object.values(activeStatsSchema)
        .filter(stat => stat.iconPath)
        .map(stat => stat.iconPath);
    const randomIconPath = iconPaths[Math.floor(Math.random() * iconPaths.length)];

    const addEmbed = (additionalInfo: boolean) => {
        const embed = new EmbedBuilder()
            .setTitle(`${getTranslation('stats_command.global_stats_title.0', locale, ELocaleNamespace.Messages)} "${getTranslation(activeTab.name, locale, ELocaleNamespace.Messages)}" ${getTranslation('stats_command.global_stats_title.1', locale, ELocaleNamespace.Messages)}`)
            .addFields(fields)
            .setColor(Constants.DEFAULT_DISCORD_COLOR)
            .setTimestamp();

        if (additionalInfo) {
            embed.setDescription(`${getTranslation('stats_command.data_collected_from.0', locale, ELocaleNamespace.Messages)} **${playerCount}** ${getTranslation('stats_command.data_collected_from.1', locale, ELocaleNamespace.Messages)}.`);
        }

        if (additionalInfo && randomIconPath) {
            embed.setThumbnail(combineBaseUrlWithPath(randomIconPath));
        }

        embeds.push(embed);

        fields.length = 0;
    };

    let isFirstEmbed = true;
    for (const [statKey, stat] of Object.entries(activeStatsSchema)) {
        fields.push({
            name: formatNumber(globalStats[statKey]),
            value: stat.description,
            inline: true
        });

        if (fields.length === 25) {
            addEmbed(isFirstEmbed);
            isFirstEmbed = false;
        }
    }

    if (fields.length > 0) {
        addEmbed(isFirstEmbed);
    }

    return embeds;
}

export function createTabButtons(tabsData: typeof GlobalStatTabs, locale: Locale, interaction: ChatInputCommandInteraction | ButtonInteraction) {
    const buttons = tabsData.map(tab =>
        new ButtonBuilder()
            .setCustomId(`global_stats_tab::${tab.id}::${interaction.user.id}`)
            .setLabel(getTranslation(tab.name, locale, ELocaleNamespace.Messages))
            .setStyle(tab.active ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );

    // Group buttons into rows (max 5 buttons per row)
    const buttonRows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let i = 0; i < buttons.length; i += 5) {
        buttonRows.push(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                buttons.slice(i, i + 5)
            )
        );
    }
    return buttonRows;
}

// endregion