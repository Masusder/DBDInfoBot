import axios from '../utils/apiClient';
import { IBuildFilters } from "../types/build";
import { getCache, setCache } from "../cache";

export async function retrieveBuilds(filters: IBuildFilters): Promise<any | undefined> {
    try {
        const response = await axios.get(`/api/builds/${filters.page}?role=${filters.role}&character=${filters.character}&category=${filters.category}&rating=${filters.rating}&version=${filters.version}&searchInput=${filters.searchInput}`);
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error("Failed to fetch builds: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching builds:', error);
    }
}

export async function getCachedInclusionVersions(): Promise<string[]> {
    let inclusionVersions = getCache<string[]>('buildInclusionVersions');

    if (!inclusionVersions) {
        console.warn("Build inclusion versions cache expired or empty. Fetching new data...");
        const buildData = await retrieveBuilds({ "page": 0, "role": "Killer" } as IBuildFilters); // Pass dummy filters, they don't matter anyway, we only want available versions
        const newInclusionVersions: string[] = buildData.availableVersions;

        setCache('buildInclusionVersions', newInclusionVersions);

        return newInclusionVersions;
    }

    return inclusionVersions;
}