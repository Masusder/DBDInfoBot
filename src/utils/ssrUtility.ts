import React from 'react';
import ReactDOMServer from 'react-dom/server';
import puppeteer from 'puppeteer';
import PlayerStats from "@ui/components/StatsSummaryCard/PlayerStats";
import { getCachedCharacters } from "@services/characterService";
import { getCachedMaps } from "@services/mapService";
import { Locale } from "discord.js";
import { IPlayerData } from "@ui/types/playerStats";
import * as fs from "node:fs";
import * as path from "node:path";

const CHROMIUM_PATH: string | undefined = process.env.CHROMIUM_PATH;
export const generatePlayerStatsSummary = async(playerData: IPlayerData): Promise<Buffer | null> => {
    try {
        const [characterData, mapsData] = await Promise.all([
            await getCachedCharacters(Locale.EnglishUS),
            await getCachedMaps(Locale.EnglishUS)
        ]);

        if (!playerData || !characterData || !mapsData) {
            console.warn("Data not found. Failed to render player stats summary.");
            return null;
        }

        const browser = await puppeteer.launch({
            ...(CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : {})
        });
        const page = await browser.newPage();

        const props = { characterData, mapsData, playerData };

        const html = ReactDOMServer.renderToString(React.createElement(PlayerStats, props));

        const cssFilePath = path.resolve(process.cwd(), 'src/ui/components/StatsSummaryCard/PlayerStats.css');
        const cssContent = fs.readFileSync(cssFilePath, 'utf-8');

        await page.setContent(`
            <html lang="en">
              <head>
                <title>DBDInfo</title>
                <style>${cssContent}</style>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
              </head>
              <body>${html}</body>
            </html>
          `);

        await page.setViewport({
            width: 1980,
            height: 1180
        });

        const imageBuffer = Buffer.from(await page.screenshot({ omitBackground: true }));
        await browser.close();

        return imageBuffer;
    } catch (error) {
        console.log(error);
        console.error("Failed generating player stats summary card.");
        return null;
    }
};
