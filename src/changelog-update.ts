//import axios from 'axios';
import {
    AttachmentBuilder,
    Client,
    ColorResolvable,
    EmbedBuilder,
    GatewayIntentBits,
    TextChannel
} from 'discord.js';
import * as dotenv from "dotenv";
import * as fs from "node:fs";
import * as path from "node:path";

dotenv.config();

const DISCORD_TOKEN: string | undefined = process.env.DISCORD_TOKEN;
const GUILD_ID: string | undefined = '743890446450688040';
const CHANNEL_ID = '1294865737479098429';
const ROLE_ID = '1160277775383548044';

const changelog = {
    version: 'v1.1.0 (Discord Bot)',
    description: `Hello! With this release, I'm introducing in-game news command, bringing the recently revamped in-game News section directly to your Discord server.`,
    fields: [
        {
            name: 'New command:',
            value: ' - /news \n  - Retrieves latest in-game news, you can then select news article using a menu selection. Selected articles will be sent as ephemeral messages to the user making the selection. \n\nThis command is integrated with game data, showcasing cosmetics, redirecting to external links, and more. Articles are localized into 15 supported languages (if you spot missing translations, blame the devs, not me please :pleading_face:).',
            inline: false
        },
        {
            name: 'Automated news:',
            value: ' - Stay up-to-date by following <#1312117100428660736>, where in-game news will be posted automatically.',
            inline: false
        }
    ],
    releaseDate: new Date().toLocaleDateString(),
    images: []
};

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async() => {
    console.log(`Logged in as ${client.user?.tag}!`);

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const channel = guild.channels.cache.get(CHANNEL_ID) as TextChannel;

        if (!channel || channel.type !== 0) {
            console.error('The specified channel is not a valid text channel.');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(`Changelog ${changelog.version}`)
            .setDescription(changelog.description)
            .setColor(getRandomBrightColor() as ColorResolvable)
            .setAuthor({
                name: 'DBDInfo',
                iconURL: "https://i.imgur.com/M0xf9lr.png",
                url: 'https://dbd-info.com'
            })
            .setTimestamp()
            .setFooter({
                text: `Version - ${changelog.version.replace(" (Discord Bot)", '')}`,
                iconURL: 'https://cdn.discordapp.com/avatars/377493906063097866/c50109b2b1d2c486b4b0aecf43ab7487?size=1024'
            });

        changelog.fields.forEach(field => embed.addFields(field));

        const imageAttachments = [];
        for (const imageUrl of changelog.images) {
            // From network
            // const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            // const buffer = Buffer.from(response.data, 'binary');
            // const attachment = new AttachmentBuilder(buffer, { name: 'changelog.png' });
            // imageAttachments.push(attachment);

            // From local files
            const imageBuffer = fs.readFileSync(path.resolve(imageUrl));
            const attachment = new AttachmentBuilder(imageBuffer, { name: path.basename(imageUrl) });
            imageAttachments.push(attachment);
        }

        const imagesBuffer = fs.readFileSync(path.resolve(changelog.images[0]));
        if (imagesBuffer) {
            embed.setImage(`attachment://changelog_image.png`)
        }

        await channel.send({
            content: `<@&${ROLE_ID}>`,
            embeds: [embed],
            files: [{
                attachment: imagesBuffer,
                name: 'changelog_image.png'
            }]
        });

        console.log('Changelog embed sent successfully!');
    } catch (error) {
        console.error('Failed to send changelog embed:', error);
    } finally {
        await client.destroy();
    }
});

function getRandomBrightColor() {
    const getBrightComponent = () => Math.floor(Math.random() * 156) + 100;

    const r = getBrightComponent();
    const g = getBrightComponent();
    const b = getBrightComponent();

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// noinspection JSIgnoredPromiseFromCall
client.login(DISCORD_TOKEN);
