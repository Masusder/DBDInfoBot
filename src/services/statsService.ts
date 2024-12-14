import axios from "@utils/apiClient";
import {
    getCache,
    setCache
} from "../cache";

async function retrieveGlobalStats(): Promise<any | undefined> {
    try {
        const response = await axios.get('/api/global-stats');
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error("Failed to fetch global stats: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching global stats:', error);
    }
}

async function retrievePlayerStats(playerId: string) {
    try {
        const response = await axios.get(`/api/playerStatistics?playerId=${playerId}`);
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error("Failed to fetch player stats: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching player stats:', error);
    }
}

export async function getCachedPlayerStats(playerId: string): Promise<any | undefined> {
    let playerStatsData = getCache<any>(`playerStatsData-${playerId}`);

    if (!playerStatsData) {
        console.warn("Player stats cache expired or empty. Fetching new data...");
        playerStatsData = await retrievePlayerStats(playerId);

        setCache(`playerStatsData-${playerId}`, playerStatsData);

        return playerStatsData;
    }

    return playerStatsData;
}

export async function getCachedGlobalStats(): Promise<any | undefined> {
    let globalStatsData = getCache<any>('globalStatsData');

    if (!globalStatsData) {
        console.warn("Global stats cache expired or empty. Fetching new data...");
        globalStatsData = await retrieveGlobalStats();

        setCache('globalStatsData', globalStatsData);

        return globalStatsData;
    }

    return globalStatsData;
}