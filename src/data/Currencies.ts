import { combineBaseUrlWithPath } from "@utils/stringUtils";

interface ICurrency {
    localizedName: string;
    iconPath: string;
    emojiId: string;
}

export const Currencies: Record<string, ICurrency> = {
    Cells: {
        localizedName: "currencies.auric_cells",
        iconPath: combineBaseUrlWithPath('/images/Currency/AuricCells_Icon.png'),
        emojiId: "AuricCells"
    },
    Shards: {
        localizedName: "currencies.shards",
        iconPath: combineBaseUrlWithPath('/images/Currency/Shards_Icon.png'),
        emojiId: "Shards"
    },
    Bloodpoints: {
        localizedName: "currencies.bloodpoints",
        iconPath: combineBaseUrlWithPath('/images/Currency/BloodpointsIcon.png'),
        emojiId: "Bloodpoints"
    },
    WinterEventCurrency: {
        localizedName: "currencies.winter_event_currency",
        iconPath: combineBaseUrlWithPath('/images/Currency/WinterEventCurrency_Icon.png'),
        emojiId: "WinterEventCurrency"
    },
    AnniversaryEventCurrency: {
        localizedName: "currencies.anniversary_event_currency",
        iconPath: combineBaseUrlWithPath('/images/Currency/AnniversaryEventCurrency_Icon.png'),
        emojiId: "AnniversaryEventCurrency"
    },
    HalloweenEventCurrency: {
        localizedName: "currencies.halloween_event_currency",
        iconPath: combineBaseUrlWithPath('/images/Currency/HalloweenEventCurrency_Icon.png'),
        emojiId: "HalloweenEventCurrency"
    },
    SpringEventCurrency: {
        localizedName: "currencies.spring_event_currency",
        iconPath: combineBaseUrlWithPath('/images/Currency/SpringEventCurrency_Icon.png'),
        emojiId: "SpringEventCurrency"
    },
    RiftFragments: {
        localizedName: "currencies.rift_fragments",
        iconPath: combineBaseUrlWithPath('/images/Currency/RiftFragmentsIcon.png'),
        emojiId: "RiftFragments"
    },
    PutridSerum: {
        localizedName: "currencies.putrid_serum",
        iconPath: combineBaseUrlWithPath('/images/Currency/PutridSerum_Icon.png'),
        emojiId: "PutridSerum"
    }
};