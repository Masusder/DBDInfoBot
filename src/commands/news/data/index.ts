import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { INewsDataTable } from "../types";
import { ThemeColors } from "@constants/themeColors";

// UI_InboxMenuSkin_DataTable.uasset
export const NewsDataTable: Record<string, INewsDataTable> = {
    Inbox: {
        icon: combineBaseUrlWithPath("/images/News/icon_Messages.png"),
        primaryColor: ThemeColors.PRIMARY_LIGHT,
        secondaryColor: ThemeColors.PRIMARY_LIGHT,
    },
    News: {
        icon: combineBaseUrlWithPath("/images/News/icon_News.png"),
        primaryColor: "#4c6f7e",
        secondaryColor: "#3C4C56"
    },
    Halloween: {
        icon: combineBaseUrlWithPath("/images/News/icon_Event_Halloween.png"),
        primaryColor: "#19bfb8",
        secondaryColor: "#B32100"
    },
    Winter: {
        icon: combineBaseUrlWithPath("/images/News/icon_Event_Winter.png"),
        primaryColor: "#1684d1",
        secondaryColor: "#2149B3"
    },
    Spring: {
        icon: combineBaseUrlWithPath("/images/News/icon_Event_Spring.png"),
        primaryColor: "#c31a2e",
        secondaryColor: "#EEA8E8"
    },
    Anniversary: {
        icon: combineBaseUrlWithPath("/images/News/icon_Event_Anniversary.png"),
        primaryColor: "#dda018",
        secondaryColor: "#BB953B"
    }
};