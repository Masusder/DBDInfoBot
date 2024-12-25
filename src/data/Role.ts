import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { ColorResolvable } from "discord.js";
import { ThemeColors } from "@constants/themeColors";

interface IRole {
    Survivor: {
        localizedName: string;
        perkBackground: string;
        charPortrait: string;
        hexColor: ColorResolvable;
    },
    Killer: {
        localizedName: string;
        perkBackground: string;
        charPortrait: string;
        hexColor: ColorResolvable;
    },
    None: {
        localizedName: string;
        hexColor: ColorResolvable;
    }
}

export const Role: IRole = {
    Survivor: {
        localizedName: "roles.survivor",
        perkBackground: combineBaseUrlWithPath('/images/Other/SurvivorRarity.png'),
        charPortrait: combineBaseUrlWithPath('/images/Other/CharPortraitSurvivor.png'),
        hexColor: "#1e90ff"
    },
    Killer: {
        localizedName: "roles.killer",
        perkBackground: combineBaseUrlWithPath('/images/Other/KillerRarity.png'),
        charPortrait: combineBaseUrlWithPath('/images/Other/CharPortraitKiller.png'),
        hexColor: ThemeColors.KILLER
    },
    None: {
        localizedName: "roles.none",
        hexColor: ThemeColors.SURVIVOR
    }
};