/**
 * See https://github.com/Masusder/UEParser/blob/master/UEParser/Models/APIComposerModels/Collection.cs
 */
export interface Collection {
    CollectionId: string;
    AdditionalImages: string[];
    CollectionTitle: string;
    CollectionSubtitle: string;
    HeroImage: string;
    HeroVideo: string;
    InclusionVersion: string;
    /**
     * ISO 8601 string
     */
    UpdatedDate: string;
    /**
     * ISO 8601 string
     */
    LimitedAvailabilityStartDate?: string | null;
    Items: string[];
    SortOrder: string;
    VisibleBeforeStartDate: boolean;
}