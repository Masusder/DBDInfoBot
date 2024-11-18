export interface IBuildFilters {
    page: number;
    searchInput?: string | null;
    category: 'fun' | 'tomeChallenge' | 'competitive' | 'beginner' | 'intermediate' | 'advanced' | 'other' | string | null;
    role: 'Killer' | 'Survivor';
    character: 'None' | string | null;
    version: string | null;
    rating: number | null;
}

export interface IBuild {
    buildId: string;
    userId: string;
    username: string;
    avatarURL?: string | null | undefined;
    itemPower: string;
    perk1: string;
    perk2: string;
    perk3: string;
    perk4: string;
    addon1: string;
    addon2: string;
    offering: string;
    role: 'Killer' | 'Survivor';
    title: string;
    description: string;
    character: 'None' | string;
    category: 'fun' | 'tomeChallenge' | 'competitive' | 'beginner' | 'intermediate' | 'advanced' | 'other';
    patch: string,
    averageRating: number;
    ratingCount?: number;
    userRating?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBuildsResponse {
    builds: IBuild[];
    availableVersions: string[];
    totalPages: number;
    currentPage: number;
    totalBuilds: number;
}