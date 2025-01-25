import React from 'react';
import ReactDOMServer from 'react-dom/server';
import puppeteer from 'puppeteer';
import * as fs from "node:fs";
import * as path from "node:path";

export async function renderBrowserBuffer(
    Component: React.FunctionComponent<any>,
    stylesRelativeFilePath: string,
    width: number,
    height: number,
    props: any
): Promise<Buffer | null> {
    const CHROMIUM_PATH: string | undefined = process.env.CHROMIUM_PATH;

    try {
        const browser = await puppeteer.launch({
            ...(CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : {})
        });

        const page = await browser.newPage();

        const html = ReactDOMServer.renderToString(React.createElement(Component, props));

        const stylesFilePath = path.resolve(process.cwd(), stylesRelativeFilePath);
        const cssContent = fs.readFileSync(stylesFilePath, 'utf-8');

        await page.setContent(`
            <html lang="en">
              <head>
                <title>DBDInfo</title>
                <style>${cssContent}</style>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,100..1000&display=swap" rel="stylesheet">
              </head>
              <body>${html}</body>
            </html>
          `);

        await page.setViewport({
            width: width,
            height: height
        });

        const imageBuffer = Buffer.from(await page.screenshot({ omitBackground: true }));
        await browser.close(); // Dispose

        return imageBuffer;
    } catch (error) {
        console.log(error);
        console.error("Failed generating puppeteer buffer.");
        return null;
    }
}
