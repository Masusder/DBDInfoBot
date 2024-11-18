import {
    ButtonInteraction,
    ColorResolvable,
    EmbedBuilder,
    Locale
} from 'discord.js';
import {
    formatHtmlToDiscordMarkdown
} from '@utils/stringUtils';
import { getCharacterDataByIndex } from "@services/characterService";
import {
    IPaginationOptions,
    genericPaginationHandler
} from "./genericPaginationHandler";
import { getTranslation } from "@utils/localizationUtils";
import { sendUnauthorizedMessage } from "./unauthorizedHandler";

const MAX_DESCRIPTION_LENGTH = 3000;

function createEmbed(description: string, characterName: string, color: number | null, locale: Locale) {
    return new EmbedBuilder()
        .setTitle(`${getTranslation('info_command.character_subcommand.backstory', locale, 'messages')} ${characterName}`)
        .setDescription(description)
        .setColor(color as ColorResolvable)
        .setTimestamp()
        .setFooter(
            {
                text: `${getTranslation('info_command.character_subcommand.character_backstory', locale, 'messages')}`
            }
        );
}

// Function to create embed chunks without splitting sentences
function createBackstoryEmbeds(backstory: string, characterName: string, color: number | null, locale: Locale) {
    const embeds: EmbedBuilder[] = [];
    const sentenceRegex = /([.!?]\s+|\n)/g; // Matches sentence-ending punctuation followed by a space or a newline

    let currentChunk = '';
    const sentences = backstory.split(sentenceRegex);

    for (const sentence of sentences) {
        const newChunk = currentChunk + sentence;

        if (newChunk.length <= MAX_DESCRIPTION_LENGTH) {
            // If adding this sentence doesn't exceed the max length, keep it in the current chunk
            currentChunk = newChunk;
        } else {
            // If it exceeds the max length, push the current chunk as an embed and start a new chunk
            if (currentChunk) {
                embeds.push(createEmbed(currentChunk, characterName, color, locale));
            }
            currentChunk = sentence;
        }
    }

    if (currentChunk) {
        embeds.push(createEmbed(currentChunk, characterName, color, locale));
    }

    return embeds;
}

export async function showCharacterBackstoryHandler(interaction: ButtonInteraction) {
    const [_, characterIndex, userId] = interaction.customId.split('::');

    if (userId !== interaction.user.id) {
        await sendUnauthorizedMessage(interaction);
        return;
    }

    const locale = interaction.locale;

    if (!characterIndex) {
        await interaction.followUp({
            content: getTranslation('info_command.character_subcommand.invalid_index', locale, 'errors'),
            ephemeral: true
        });
        return;
    }

    const characterData = await getCharacterDataByIndex(characterIndex, locale);
    if (!characterData) {
        await interaction.followUp({
            content: getTranslation('info_command.character_subcommand.error_retrieving_data', locale, 'errors'),
            ephemeral: true
        });
        return;
    }

    const backstory = formatHtmlToDiscordMarkdown(characterData.BackStory);
    const characterName = characterData.Name;
    const color = interaction.message.embeds[0].color;

    const embeds = createBackstoryEmbeds(backstory, characterName, color, locale);

    const paginationOptions: IPaginationOptions = {
        items: embeds,
        itemsPerPage: 1,
        generateEmbed: (pageItems) => pageItems[0],
        interactionUserId: interaction.user.id,
        interactionReply: interaction,
        timeout: 300_000, // 5 minutes
        locale
    };

    await genericPaginationHandler(paginationOptions);
}