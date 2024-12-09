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

export async function handlePersonalStatsCommandInteraction(interaction: ChatInputCommandInteraction) {
    const steamId = interaction.options.getString('steam_id');
    const locale = interaction.locale;

    try {
        await interaction.deferReply();

        if (!steamId) return; // TODO: reply with message

        const playerDataCached: any = await getCachedPlayerStats(steamId);
        const playerData = deconstructPlayerStatsData(playerDataCached);

        if (!playerData) return; // TODO: reply with message

        const summaryCardBuffer = await generatePlayerStatsSummary(playerData);

        if (!summaryCardBuffer) return; // TODO: reply with message

        const embed = new EmbedBuilder()
            .setColor(Constants.DEFAULT_DISCORD_COLOR)
            .setTitle("Player Statistics Overview") // TODO: localize
            .setDescription("A quick infographic summary of the player's stats.") // TODO: localize
            .setTimestamp()
            .setImage('attachment://playerStatsSummary.png')
            .setAuthor({
                name: playerData.steam.playerName,
                iconURL: playerData.steam.avatarIcon
            });

        const actionRow = createRedirectButton(steamId, locale);

        await interaction.editReply({
            embeds: [embed],
            components: [actionRow],
            files: [{
                attachment: summaryCardBuffer,
                name: 'playerStatsSummary.png'
            }]
        });
    } catch (error) {
        console.error("Error executing player stats subcommand:", error);
    }
}

// region Utils
function deconstructPlayerStatsData(playerData: any): IPlayerData | null {
    if (!playerData?.playerSummary?.response?.players?.length || !playerData?.playerStats?.playerstats?.stats) {
        return null;
    }

    const steam = playerData.playerSummary.response.players[0];
    const stats = playerData.playerStats.playerstats.stats;
    const achievements = playerData?.playerAchievements?.playerstats?.achievements || [];
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
            playtimeLastTwoWeeks: playtimeLastTwoWeeks
        },
        stats: stats,
        achievements: achievements,
        achievementSchema: achievementSchema,
        statsSchema: statsSchema
    };
}

function createRedirectButton(steamId: string, locale: Locale): ActionRowBuilder<ButtonBuilder> {
    const redirectUrl = combineBaseUrlWithPath(`/player-profile/${encodeURIComponent(steamId)}/overview`)

    const button = new ButtonBuilder()
        .setLabel('Full Stats') // TODO: localize
        .setStyle(ButtonStyle.Link)
        .setURL(redirectUrl);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
}

// endregion
