import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale
} from "discord.js";
import Constants from "../../constants.ts";
import { generatePlayerStatsSummary } from "@utils/ssrUtility.ts";
import { getCachedPlayerStats } from "@services/statsService.ts";
import { IPlayerData } from "@ui/types/playerStats.ts";
import { getTranslation } from "@utils/localizationUtils.ts";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace.ts";
import { combineBaseUrlWithPath } from "@utils/stringUtils.ts";
import { sendErrorMessage } from "@handlers/errorResponseHandler.ts";

export async function handlePersonalStatsCommandInteraction(interaction: ChatInputCommandInteraction) {
    const steamId = interaction.options.getString('steam_id');
    const locale = interaction.locale;

    try {
        await interaction.deferReply();

        if (!steamId) {
            const message = getTranslation('stats_command.missing_steam_id', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        const playerDataCached: any = await getCachedPlayerStats(steamId);
        const playerData = deconstructPlayerStatsData(playerDataCached);

        if (!playerData) {
            const message = getTranslation('stats_command.not_found_player_data', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        const summaryCardBuffer = await generatePlayerStatsSummary(playerData);

        if (!summaryCardBuffer) {
            const message = getTranslation('stats_command.failed_generating_summary_card', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        // noinspection SpellCheckingInspection
        const embed = new EmbedBuilder()
            .setColor(Constants.DEFAULT_DISCORD_COLOR)
            .setTitle(getTranslation('stats_command.player_stats_overview', locale, ELocaleNamespace.Messages))
            .setDescription(getTranslation('stats_command.summary_desc', locale, ELocaleNamespace.Messages))
            .setTimestamp()
            .setImage(`attachment://playerStatsSummary_${playerData.steam.steamId}.png`)
            .setThumbnail(combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_DBDlogo.png'))
            .setAuthor({
                name: playerData.steam.playerName,
                iconURL: playerData.steam.avatarIcon,
                url: playerData.steam.profileUrl
            });

        const actionRow = createRedirectButton(steamId, locale);

        await interaction.editReply({
            embeds: [embed],
            components: [actionRow],
            files: [{
                attachment: summaryCardBuffer,
                name: `playerStatsSummary_${playerData.steam.steamId}.png`
            }]
        });
    } catch (error) {
        console.error("Error executing player stats subcommand:", error);
    }
}

// region Utils
function deconstructPlayerStatsData(playerData: any): IPlayerData | null {
    if (!playerData?.playerSummary?.response?.players?.length || !playerData?.playerStats?.playerstats?.stats || !playerData?.playerAchievements?.playerstats?.achievements.length) {
        return null;
    }

    const steam = playerData.playerSummary.response.players[0];
    const stats = playerData.playerStats.playerstats.stats;
    const achievements = playerData?.playerAchievements?.playerstats?.achievements;
    const achievementSchema = playerData?.achievementsSchema || [];
    const statsSchema = playerData?.statsSchema || {};
    const playtime = playerData?.ownedGames?.appId?.playtime_forever || null;
    const playtimeLastTwoWeeks = playerData?.ownedGames?.appId?.playtime_2weeks || null;

    return {
        steam: {
            avatarIcon: steam.avatarfull,
            playerName: steam.personaname,
            steamId: steam.steamid,
            playtime: playtime,
            playtimeLastTwoWeeks: playtimeLastTwoWeeks,
            profileUrl: steam.profileurl
        },
        stats: stats,
        achievements: achievements,
        achievementSchema: achievementSchema,
        statsSchema: statsSchema
    };
}

function createRedirectButton(steamId: string, locale: Locale): ActionRowBuilder<ButtonBuilder> {
    const redirectUrl = combineBaseUrlWithPath(`/player-profile/${encodeURIComponent(steamId)}/overview`);

    const button = new ButtonBuilder()
        .setLabel(getTranslation('stats_command.full_stats', locale, ELocaleNamespace.Messages))
        .setStyle(ButtonStyle.Link)
        .setURL(redirectUrl);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
}

// endregion
