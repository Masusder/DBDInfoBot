import { combineBaseUrlWithPath } from "@utils/stringUtils";

interface ICurrency {
    localizedName: string;
    iconPath: string;
    backgroundPath: string;
    emojiId: string;
}

export interface ICurrencyAmount extends ICurrency {
    amount: number;
}

export const Currencies: Record<string, ICurrency> = {
    Cells: {
        localizedName: "currencies.auric_cells",
        iconPath: combineBaseUrlWithPath('/images/Currency/AuricCells_Icon.png'),
        backgroundPath: combineBaseUrlWithPath('/images/Currency/CurrencyBackground_AuricCells.png'),
        emojiId: "AuricCells"
    },
    Shards: {
        localizedName: "currencies.shards",
        iconPath: combineBaseUrlWithPath('/images/Currency/Shards_Icon.png'),
        backgroundPath: combineBaseUrlWithPath('/images/Currency/CurrencyBackground_Shards.png'),
        emojiId: "Shards"
    },
    Bloodpoints: {
        localizedName: "currencies.bloodpoints",
        iconPath: combineBaseUrlWithPath('/images/Currency/Bloodpoints_Icon.png'),
        backgroundPath: combineBaseUrlWithPath('/images/Currency/CurrencyBackground_Bloodpoints.png'),
        emojiId: "Bloodpoints"
    },
    // BonusBloodpoints differs from Bloodpoints only in the fact
    // that it's not capped by Bloodpoints limit
    BonusBloodpoints: {
        localizedName: "currencies.bloodpoints",
        iconPath: combineBaseUrlWithPath('/images/Currency/Bloodpoints_Icon.png'),
        backgroundPath: combineBaseUrlWithPath('/images/Currency/CurrencyBackground_Bloodpoints.png'),
        emojiId: "Bloodpoints"
    },
    WinterEventCurrency: {
        localizedName: "currencies.winter_event_currency",
        iconPath: combineBaseUrlWithPath('/images/Currency/WinterEventCurrency_Icon.png'),
        backgroundPath: combineBaseUrlWithPath('/images/Currency/CurrencyBackground_WinterEventCurrency.png'),
        emojiId: "WinterEventCurrency"
    },
    AnniversaryEventCurrency: {
        localizedName: "currencies.anniversary_event_currency",
        iconPath: combineBaseUrlWithPath('/images/Currency/AnniversaryEventCurrency_Icon.png'),
        backgroundPath: combineBaseUrlWithPath('/images/Currency/CurrencyBackground_AnniversaryEventCurrency.png'),
        emojiId: "AnniversaryEventCurrency"
    },
    HalloweenEventCurrency: {
        localizedName: "currencies.halloween_event_currency",
        iconPath: combineBaseUrlWithPath('/images/Currency/HalloweenEventCurrency_Icon.png'),
        backgroundPath: combineBaseUrlWithPath('/images/Currency/CurrencyBackground_HalloweenEventCurrency.png'),
        emojiId: "HalloweenEventCurrency"
    },
    SpringEventCurrency: {
        localizedName: "currencies.spring_event_currency",
        iconPath: combineBaseUrlWithPath('/images/Currency/SpringEventCurrency_Icon.png'),
        backgroundPath: combineBaseUrlWithPath('/images/Currency/CurrencyBackground_SpringEventCurrency.png'),
        emojiId: "SpringEventCurrency"
    },
    RiftFragments: {
        localizedName: "currencies.rift_fragments",
        iconPath: combineBaseUrlWithPath('/images/Currency/RiftFragmentsIcon.png'),
        backgroundPath: combineBaseUrlWithPath('/images/Currency/CurrencyBackground_RiftFragment.png'),
        emojiId: "RiftFragments"
    },
    // This currency is deprecated, devs use HalloweenEventCurrency instead
    PutridSerum: {
        localizedName: "currencies.putrid_serum",
        iconPath: combineBaseUrlWithPath('/images/Currency/PutridSerum_Icon.png'),
        backgroundPath: combineBaseUrlWithPath('/images/Currency/CurrencyBackground_HalloweenEventCurrency.png'),
        emojiId: "PutridSerum"
    }
};