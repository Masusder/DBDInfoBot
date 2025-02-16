import { combineBaseUrlWithPath } from "@utils/stringUtils";

interface ICosmeticType {
    localizedName: string;
    icon: string;
}

export const CosmeticTypes: Record<string, ICosmeticType> = {
    outfit: {
        localizedName: "cosmetic_types.outfit",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_outfits.png")
    },
    SurvivorHead: {
        localizedName: "cosmetic_types.survivor_head",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_head.png")
    },
    SurvivorTorso: {
        localizedName: "cosmetic_types.survivor_torso",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_torso.png")
    },
    SurvivorLegs: {
        localizedName: "cosmetic_types.survivor_legs",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_legs.png")
    },
    // Non-standard type
    SurvivorHand: {
        localizedName: "cosmetic_types.survivor_hand",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_hand.png")
    },
    // Non-standard type
    KillerMask: {
        localizedName: "cosmetic_types.killer_mask",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_masks.png")
    },
    KillerHead: {
        localizedName: "cosmetic_types.killer_head",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_head.png")
    },
    // Non-standard type
    KillerUpperBody: {
        localizedName: "cosmetic_types.killer_upper_body",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_upperBody.png")
    },
    KillerBody: {
        localizedName: "cosmetic_types.killer_body",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_body.png")
    },
    // Non-standard type
    KillerTorso: {
        localizedName: "cosmetic_types.killer_body",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_body.png")
    },
    // Non-standard type
    KillerLowerBody: {
        localizedName: "cosmetic_types.killer_lower_body",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_legs.png")
    },
    KillerWeapon: {
        localizedName: "cosmetic_types.killer_weapon",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_weapons.png")
    },
    // Non-standard type
    KillerPower: {
        localizedName: "cosmetic_types.killer_power",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_weapons.png")
    },
    // Non-standard type
    KillerArm: {
        localizedName: "cosmetic_types.killer_arm",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_arm.png")
    },
    Charm: {
        localizedName: "cosmetic_types.charm",
        icon: combineBaseUrlWithPath("/images/UI/Icons/StoreTabs/categoryIcon_charms.png")
    },
    Badge: {
        localizedName: "cosmetic_types.badge",
        icon: combineBaseUrlWithPath("/images/Plugins/Runtime/Bhvr/DBDUICore/Content/Assets/ProfileMenu/T_UI_categoryIcon_badge.png")
    },
    Banner: {
        localizedName: "cosmetic_types.banner",
        icon: combineBaseUrlWithPath("/images/Plugins/Runtime/Bhvr/DBDUICore/Content/Assets/ProfileMenu/T_UI_categoryIcon_banner.png")
    }
};