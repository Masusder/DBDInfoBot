import {
    ButtonInteraction,
    EmbedBuilder,
    Locale,
    MessageFlags
} from 'discord.js';
import {
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown
} from '@utils/stringUtils';
import { getCharacterDataByIndex } from "@services/characterService";
import {
    paginationHandler,
    IPaginationOptions
} from "@handlers/paginationHandler";
import { t } from "@utils/localizationUtils";
import { sendUnauthorizedMessage } from "@handlers/unauthorizedHandler";
import { ELocaleNamespace } from '@tps/enums/ELocaleNamespace';
import { Hint } from "@tps/character";
import { ERole } from "@tps/enums/ERole";
import { Role } from "@data/Role";

export async function characterHintsHandler(interaction: ButtonInteraction) {
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

    const embeds = createEmbeds(characterData.Hints, characterData.Name, locale);

    const paginationOptions: IPaginationOptions = {
        items: embeds,
        itemsPerPage: 1,
        generateEmbed: (pageItems) => pageItems[0],
        interactionUserId: interaction.user.id,
        interactionReply: interaction,
        timeout: 60_000, // 1 minute
        locale
    };

    await paginationHandler(paginationOptions);
}

function createEmbed(
    description: string,
    iconPath: string,
    title: string,
    role: ERole,
    characterName: string,
    locale: Locale
) {
    return new EmbedBuilder()
        .setTitle(title)
        .setThumbnail(iconPath)
        .setDescription(description)
        .setColor(Role[role].hexColor)
        .setTimestamp()
        .setFooter({
            text: t('info_command.character_subcommand.hint_for', locale, ELocaleNamespace.Messages, {
                character_name: characterName
            })
        });
}

function createEmbeds(hints: Hint[], characterName: string, locale: Locale) {
    const embeds: EmbedBuilder[] = [];

    for (const hint of hints) {
        embeds.push(createEmbed(formatHtmlToDiscordMarkdown(hint.Description), combineBaseUrlWithPath(hint.IconPath), hint.Title, hint.Role, characterName, locale));
    }

    return embeds;
}