import axios from '../utils/apiClient';
import {
    IBuild,
    IBuildFilters,
    IBuildsResponse
} from "../types";
import {
    getCache,
    setCache
} from "../cache";

/**
 * Fetches a list of builds from the API based on the provided filters.
 *
 * @param filters - An object containing the filters for retrieving builds.
 *                  Includes properties like page, role, character, category, rating, version, and searchInput.
 * @returns {Promise<IBuildsResponse | undefined>} A promise resolving to the build response data if successful, or undefined if the request fails.
 */
export async function retrieveBuilds(filters: IBuildFilters): Promise<IBuildsResponse | undefined> {
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

/**
 * Fetches detailed information for a specific build by its ID.
 *
 * @param id - The unique identifier of the build.
 * @returns {Promise<IBuild | undefined>} A promise resolving to the build data if successful, or undefined if the request fails.
 */
export async function retrieveBuildById(id: string): Promise<IBuild | undefined> {
    try {
        const response = await axios.get(`/api/build/find/${id}`);
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error("Failed to fetch builds: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching builds:', error);
    }
}

/**
 * Retrieves the inclusion versions of builds, using a cached value if available.
 * If the cache is empty or expired, fetches the data from the API and updates the cache.
 *
 * @returns {Promise<string[]>} A promise resolving to an array of inclusion versions.
 */
export async function getCachedInclusionVersions(): Promise<string[]> {
    let inclusionVersions = getCache<string[]>('buildInclusionVersions');

    if (!inclusionVersions) {
        console.warn("Build inclusion versions cache expired or empty. Fetching new data...");
        const buildData = await retrieveBuilds({ "page": 0, "role": "Killer" } as IBuildFilters); // Pass dummy filters, they don't matter anyway, we only want available versions

        if (!buildData) return [];

        const newInclusionVersions: string[] = buildData.availableVersions;

        setCache('buildInclusionVersions', newInclusionVersions);

        return newInclusionVersions;
    }

    return inclusionVersions;
}