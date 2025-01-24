import { IStatsSchema } from "@ui/components/StatsSummaryCard/types/playerStats";
import {
    GlobalStatTabs,
    IGlobalStatTab
} from "@data/GlobalStatTabs";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale
} from "discord.js";
import {
    combineBaseUrlWithPath,
    formatNumber
} from "@utils/stringUtils";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { ThemeColors } from "@constants/themeColors";

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
            .setTitle(t('stats_command.global_stats_title', locale, ELocaleNamespace.Messages, { category: t(activeTab.name, locale, ELocaleNamespace.Messages) }))
            .addFields(fields)
            .setColor(ThemeColors.PRIMARY)
            .setTimestamp();

        if (additionalInfo) {
            embed.setDescription(t('stats_command.data_collected_from', locale, ELocaleNamespace.Messages, { player_count: playerCount.toString()}));
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

export function createTabButtons(
    tabsData: typeof GlobalStatTabs,
    locale: Locale,
    interaction: ChatInputCommandInteraction | ButtonInteraction
) {
    const buttons = tabsData.map(tab =>
        new ButtonBuilder()
            .setCustomId(`global_stats_tab::${tab.id}::${interaction.user.id}`)
            .setLabel(t(tab.name, locale, ELocaleNamespace.Messages))
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