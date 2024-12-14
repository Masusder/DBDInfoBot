export interface IGlobalStatTab {
    name: string;
    id: string;
    active: boolean;
}

export const GlobalStatTabs: IGlobalStatTab[] = [
    {
        name: 'stats_command.global_stat_tabs.other',
        id: "Other",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.bloodweb',
        id: "Bloodweb",
        active: true
    },
    {
        name: 'stats_command.global_stat_tabs.wins',
        id: "Wins",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.loadout',
        id: "Loadout",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.trial_survivor',
        id: "TrialSurvivor",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.healing',
        id: "Healing",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.chase',
        id: "Chase",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.escapes',
        id: "Escapes",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.kills',
        id: "Kills",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.hooks',
        id: "Hooks",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.trial_killer',
        id: "TrialKiller",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.downs',
        id: "GeneralDowns",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.killer_downs',
        id: "SpecificDowns",
        active: false
    },
    {
        name: 'stats_command.global_stat_tabs.killer_specific',
        id: "KillerSpecific",
        active: false
    }
];

// region Utils
/**
 * Updates the active tab in the GlobalStatTabs array.
 * @param tabs - The array of global stat tabs.
 * @param newActiveTabId - The ID of the tab to set as active.
 */
export function setActiveTab(tabs: IGlobalStatTab[], newActiveTabId: string): IGlobalStatTab[] {
    return tabs.map(tab => ({
        ...tab,
        active: tab.id === newActiveTabId
    }));
}

/**
 * Retrieves a tab by its ID from the GlobalStatTabs array.
 * @param tabs - The array of global stat tabs.
 * @param tabId - The ID of the tab to retrieve.
 * @returns The tab with the specified ID, or undefined if not found.
 */
export function getTabById(tabs: IGlobalStatTab[], tabId: string): IGlobalStatTab {
    const tab = tabs.find(tab => tab.id === tabId);
    if (!tab) {
        throw new Error(`Tab with id "${tabId}" not found.`);
    }
    return tab;
}

// endregion