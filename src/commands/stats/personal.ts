import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale,
    User
} from "discord.js";
import { renderBrowserBuffer } from "@utils/ssrUtility";
import { getCachedPlayerStats } from "@services/statsService";
import { IPlayerData } from "@ui/components/StatsSummaryCard/types/playerStats";
import { getTranslation } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import {
    combineBaseUrlWithPath,
    isValidData
} from "@utils/stringUtils";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import { ThemeColors } from "@constants/themeColors";
import { getCachedCharacters } from "@services/characterService";
import { getCachedMaps } from "@services/mapService";
import PlayerStats from "@ui/components/StatsSummaryCard/PlayerStats";

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

        const summaryCardBuffer = await generatePlayerStatsSummary(playerData, interaction.user);

        if (!summaryCardBuffer) {
            const message = getTranslation('stats_command.failed_generating_summary_card', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        // noinspection SpellCheckingInspection
        const embed = new EmbedBuilder()
            .setColor(ThemeColors.PRIMARY)
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

async function generatePlayerStatsSummary(playerData: IPlayerData, user: User): Promise<Buffer | null> {
    try {
        const [characterData, mapsData] = await Promise.all([
            await getCachedCharacters(Locale.EnglishUS),
            await getCachedMaps(Locale.EnglishUS)
        ]);

        if (!isValidData(playerData) || !isValidData(characterData) || !isValidData(mapsData)) {
            console.warn("Data not found. Failed to render player stats summary.");
            return null;
        }

        const props = { characterData, mapsData, playerData, user };

        return renderBrowserBuffer(PlayerStats, 'src/ui/components/StatsSummaryCard/PlayerStats.css', 1980, 1149, props);
    } catch (error) {
        console.log(error);
        console.error("Failed generating player stats summary card.");
        return null;
    }
}

// endregion
