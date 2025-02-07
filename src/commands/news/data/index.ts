import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { INewsDataTable } from "../types";

export const NewsDataTable: Record<string, INewsDataTable> = {
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