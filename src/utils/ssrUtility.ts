import React from 'react';
import ReactDOMServer from 'react-dom/server';
import puppeteer from 'puppeteer';
import PlayerStats from "@ui/components/StatsSummaryCard/PlayerStats.tsx";
import { getCachedCharacters } from "@services/characterService.ts";
import { getCachedMaps } from "@services/mapService.ts";
import { Locale } from "discord.js";
import { IPlayerData } from "@ui/types/playerStats.ts";
import * as fs from "node:fs";
import * as path from "node:path";

export const generatePlayerStatsSummary = async(playerData: IPlayerData): Promise<Buffer | null> => {
    try {
        const characterData = await getCachedCharacters(Locale.EnglishUS);
        const mapsData = await getCachedMaps(Locale.EnglishUS);

        if (!playerData || !characterData || !mapsData) {
            console.warn("Data not found. Failed to render player stats summary.");
            return null;
        }

        const browser = await puppeteer.launch();
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
        console.error("Failed generating player stats summary card.");
        return null;
    }
};
