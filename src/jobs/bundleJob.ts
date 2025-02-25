import cron from "node-cron";
import {
    ChannelType,
    Locale,
} from "discord.js";
import { getCachedBundles } from "@services/bundleService";
import {
    adjustForTimezone,
    isValidData
} from "@utils/stringUtils";
import client from "../client";
import Constants from "@constants";
import path from "path";
import fs from "fs/promises";
import { handleBatchSendBundlesToChannel } from "@commands/info/bundle";

const DATA_DIR = path.join(process.env.APPDATA || process.env.HOME || ".", "DBDInfoBotCache");
const BUNDLE_CACHE_FILE = path.join(DATA_DIR, "dispatchedBundles.json");
let cachedBundleIds: Set<string> = new Set();
export async function startBundleJob() {
    await loadDispatchedBundles();
    // No need to check more frequent than 10 minutes
    // as bundles are cached for exactly that long
    cron.schedule('*/10 * * * *', async() => {
        await dispatchBundles();
    });
}

async function dispatchBundles() {
    try {
        console.log('Checking Bundles...');
        const bundleData = await getCachedBundles(Locale.EnglishUS);

        if (!isValidData(bundleData)) {
            console.log("Not found Bundle data.");
            return;
        }

        const currentTime = new Date();
        const validBundles = Object.values(bundleData).filter((bundle) => {
            const isNotChapterBundle = !bundle.IsChapterBundle; // Don't post chapter bundles
            const isPurchasable = bundle.Purchasable; // Bundle needs to be purchasable
            const isBundleActive = bundle.StartDate && bundle.EndDate ? (new Date(adjustForTimezone(bundle.StartDate)) < currentTime) && (new Date(adjustForTimezone(bundle.EndDate)) > currentTime) : true; // Bundle needs to be active

            return isNotChapterBundle && isPurchasable && isBundleActive;
        });

        const bundleIds = validBundles.map((bundle) => bundle.Id);
        const newBundleIds = bundleIds.filter(id => !cachedBundleIds.has(id));

        if (newBundleIds.length === 0) {
            console.log("No new bundles to dispatch.");
            return;
        }

        const channel = client.channels.cache.get(Constants.DBDLEAKS_BUNDLES_CHANNEL_ID);
        if (!channel || channel.type !== ChannelType.GuildAnnouncement) {
            console.warn(`No bundles channel found with id ${Constants.DBDLEAKS_BUNDLES_CHANNEL_ID}, or it's not announcement channel.`);
            return [];
        }

        await handleBatchSendBundlesToChannel(bundleData, newBundleIds, channel);

        newBundleIds.forEach(id => cachedBundleIds.add(id));
        await saveDispatchedBundles();

        console.log("New bundles dispatched.");
    } catch (error) {
        console.error('Error checking for Bundles:', error);
    }
}

// region Storage
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        console.error("Failed to create data directory:", error);
    }
}

async function loadDispatchedBundles() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(BUNDLE_CACHE_FILE, "utf-8");
        const ids = JSON.parse(data);
        if (Array.isArray(ids)) {
            cachedBundleIds = new Set(ids);
        }
        console.log("Loaded dispatched bundle IDs.");
    } catch (error) {
        console.warn("No dispatched bundle IDs found or failed to load.");
    }
}

async function saveDispatchedBundles() {
    try {
        await ensureDataDir();
        await fs.writeFile(BUNDLE_CACHE_FILE, JSON.stringify([...cachedBundleIds], null, 2));
        console.log("Dispatched bundle IDs saved.");
    } catch (error) {
        console.error("Failed to save dispatched bundle IDs:", error);
    }
}
// endregion