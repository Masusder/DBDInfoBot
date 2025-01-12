# DBDInfoBot
![Version](https://img.shields.io/badge/version-1.2.2-blue)
[![License](https://img.shields.io/badge/license-MIT-green)](https://opensource.org/license/mit)
[![Crowdin](https://badges.crowdin.net/dbdinfo-discord-bot/localized.svg)](https://crowdin.com/project/dbdinfo-discord-bot)
[![Discord](https://discordapp.com/api/guilds/637265123144237061/widget.png?style=shield)](https://discord.gg/dbdleaks)
<a href="https://www.dbd-info.com/" target="_blank">
    <img src="https://dbd-info.com/images/Logo/DBDInfoLogo.png" align="right" alt="Python logo" width="64">
</a>
<a href="https://discord.com/" target="_blank">
    <img src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg" align="right" alt="Discord Logo" width="64">
</a>
<br/>
A powerful Discord bot built for the [DBDInfo](https://www.dbd-info.com/) project.

## Features
- **Seamless Integration**: Brings live updates and data from the DBDInfo project to your Discord server.
- **Real-Time Updates**: Stay up to date with the latest Dead by Daylight news and info.
- **User-Friendly**: Simple to use for members.

## Links
- 🌐 [Visit the DBDInfo Website](https://www.dbd-info.com/)
- 💬 [Join the Discord Community](https://discord.gg/dbdleaks)

## Installation

### Add the Bot to Your Server
Click the link below to invite the bot to your Discord server:  
👉 [Invite DBDInfoBot](https://discord.com/oauth2/authorize?client_id=1296552447208063139)

---

## Run the Bot Locally

Follow these steps to set up and run the bot locally:

### 1. Clone the Repository

First, clone the repository and navigate into the project folder:

```bash
git clone https://github.com/Masusder/DBDInfoBot.git
cd DBDInfoBot
```

### 2. Install Dependencies
Install the required Node.js packages:

```bash
npm i
```

### 3. Configure Environment Variables
1. Copy the example environment file to create a .env file:

```bash
cp .env.example .env
```

2. Open the .env file and update the values.

### 4. Register Commands with Discord
Before running the bot, you need to register the commands to Discord. Run the following script to register the bot's commands:

```bash
npm run register
```

This step ensures that the bot's slash commands are registered with Discord.

### 5. Upload Static Emojis
Some commands require static emojis to function correctly. Upload the necessary static emojis to the bot's emoji list in the Discord Developer Portal before running the bot:

<img src="./resources/static-emojis.png" alt="Static Emojis" width="400">

### 6. Run the Bot
Start the bot in development mode:

```bash
npm run dev
```

Once the bot starts, you should see logs indicating it is online and running.