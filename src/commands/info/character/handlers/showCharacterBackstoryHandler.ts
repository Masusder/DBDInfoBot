import {
    ButtonInteraction,
    ColorResolvable,
    EmbedBuilder,
    Locale,
    MessageFlags
} from 'discord.js';
import {
    formatHtmlToDiscordMarkdown,
    splitTextIntoChunksBySentence
} from '@utils/stringUtils';
import { getCharacterDataByIndex } from "@services/characterService";
import {
    IPaginationOptions,
    paginationHandler
} from "@handlers/paginationHandler";
import { t } from "@utils/localizationUtils";
import { sendUnauthorizedMessage } from "@handlers/unauthorizedHandler";
import { ELocaleNamespace } from '@tps/enums/ELocaleNamespace';

const MAX_DESCRIPTION_LENGTH = 2024;

export async function showCharacterBackstoryHandler(interaction: ButtonInteraction) {
    // noinspection DuplicatedCode
    const [_, characterIndex, userId] = interaction.customId.split('::');

    if (userId !== interaction.user.id) {
        await sendUnauthorizedMessage(interaction);
        return;
    }

    const locale = interaction.locale;

    if (!characterIndex) {
        await interaction.followUp({
            content: t('info_command.character_subcommand.invalid_index', locale, ELocaleNamespace.Errors),
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const characterData = await getCharacterDataByIndex(characterIndex, locale);
    if (!characterData) {
        await interaction.followUp({
            content: t('info_command.character_subcommand.error_retrieving_data', locale, ELocaleNamespace.Errors),
            flags: MessageFlags.Ephemeral
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

    await paginationHandler(paginationOptions);
}

function createEmbed(description: string, characterName: string, color: number | null, locale: Locale) {
    return new EmbedBuilder()
        .setTitle(`${t('info_command.character_subcommand.backstory', locale, ELocaleNamespace.Messages)} ${characterName}`)
        .setDescription(description)
        .setColor(color as ColorResolvable)
        .setTimestamp()
        .setFooter(
            {
                text: `${t('info_command.character_subcommand.character_backstory', locale, ELocaleNamespace.Messages)}`
            }
        );
}

// Function to create embed chunks without splitting sentences
function createBackstoryEmbeds(backstory: string, characterName: string, color: number | null, locale: Locale) {
    const embeds: EmbedBuilder[] = [];

    const textChunks = splitTextIntoChunksBySentence(backstory, MAX_DESCRIPTION_LENGTH);

    for (const chunk of textChunks) {
        embeds.push(createEmbed(chunk.trim(), characterName, color, locale));
    }

    return embeds;
}