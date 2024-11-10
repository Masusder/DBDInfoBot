import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { ColorResolvable } from "discord.js";

interface IRole {
    Survivor: {
        perkBackground: string;
        charPortrait: string;
        hexColor: ColorResolvable;
    },
    Killer: {
        perkBackground: string;
        charPortrait: string;
        hexColor: ColorResolvable;
    }
}

export const Role: IRole = {
    Survivor: {
        perkBackground: combineBaseUrlWithPath('/images/Other/SurvivorRarity.png'),
        charPortrait: combineBaseUrlWithPath('/images/Other/CharPortraitSurvivor.png'),
        hexColor: "#1e90ff"
    },
    Killer: {
        perkBackground: combineBaseUrlWithPath('/images/Other/KillerRarity.png'),
        charPortrait: combineBaseUrlWithPath('/images/Other/CharPortraitKiller.png'),
        hexColor: "#ff0000"
    }
}