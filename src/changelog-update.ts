//import axios from 'axios';
import {
    AttachmentBuilder,
    Client,
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
    version: 'v1.0.0 (Discord Bot)',
    description: `Welcome to the first release of the DBDInfo Discord bot! It's hosted on <@1296552447208063139> (thanks to <@448940727188324367> for assisting with hosting).\n\nBot supports localization up to 15 languages, language is determined by language configured in your Discord settings. If you want to help with translation please read <#1294865688636166224>.\n\n**Notice:** Please refrain from using **DBDInfo (Dev)** this bot is only for development purposes and won't be active for most of the time.`,
    fields: [
        {
            name: 'Commands:',
            value: ' - /shrine \n  - Provides information about currently active Shrine of Secrets. \n - /list \n  - Provides list of items for selected feature, right now only Cosmetics or Builds are available.\n- /info \n  - Provides information about specified game feature (e.x. Cosmetic, Collection, Perk etc.)',
            inline: false
        },
        {
            name: 'Bot Features:',
            value: '- Multi-language support\n- Regular updates with new game features\n- Access to detailed game data (cosmetics, characters, perks, etc.)\n- More commands in the future',
            inline: false
        },
        {
            name: 'Installation:',
            value: '- [Click here to install bot on your server.](https://discord.com/oauth2/authorize?client_id=1296552447208063139)',
            inline: false
        },
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
            .setColor(0x00AE86)
            .setAuthor({
                name: 'DBDInfo',
                iconURL: "https://i.imgur.com/M0xf9lr.png",
                url: 'https://dbd-info.com'
            })
            .setFooter({
                text: `Changelog released on ${changelog.releaseDate}`,
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

        // const imagesBuffer = fs.readFileSync(path.resolve(changelog.images[0]));
        // if (imagesBuffer) {
        //     embed.setImage(`attachment://changelog_image.png`)
        // }

        await channel.send({
            content: `<@&${ROLE_ID}>`,
            embeds: [embed],
            // files: [{
            //     attachment: imagesBuffer,
            //     name: 'changelog_image.png'
            // }]
        });

        await channel.send({
            content: "https://discord.com/oauth2/authorize?client_id=1296552447208063139"
        });

        console.log('Changelog embed sent successfully!');
    } catch (error) {
        console.error('Failed to send changelog embed:', error);
    } finally {
        await client.destroy();
    }
});

// noinspection JSIgnoredPromiseFromCall
client.login(DISCORD_TOKEN);
