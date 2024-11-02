import axios from '../utils/apiClient';
import { IBuild, IBuildFilters } from "../types/build";

export async function retrieveBuilds(filters: IBuildFilters): Promise<any | undefined> {
    try {
        const response = await axios.get(`/api/builds/${filters.page}?role=${filters.role}&character=${filters.character}&category=${filters.category}&rating=${filters.rating}&searchInput=${filters.searchInput}`);
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error("Failed to fetch builds: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching builds:', error);
    }
}