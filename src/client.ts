import { Client, GatewayIntentBits } from 'discord.js';

const client: Client<boolean> = new Client({ intents: [GatewayIntentBits.Guilds] });

export default client;