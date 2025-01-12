import { IBuild } from "@tps/build";
import { Perk } from "@tps/perk";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Locale,
    StringSelectMenuBuilder
} from "discord.js";
import { getTranslation } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { ThemeColors } from "@constants/themeColors";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import {
    getApplicationEmoji,
    getOrCreateApplicationEmoji
} from "@utils/emojiManager";
import { layerIcons } from "@utils/imageUtils";
import { Role } from "@data/Role";

export async function createEmbed(
    role: 'Killer' | 'Survivor',
    builds: IBuild[],
    currentPage: number,
    totalPages: number,
    perkData: { [key: string]: Perk },
    locale: Locale) {
    const embed = new EmbedBuilder()
        .setTitle(`${getTranslation('list_command.builds_subcommand.builds_list', locale, ELocaleNamespace.Messages)} - ${getTranslation('list_command.builds_subcommand.builds_list_page.0', locale, ELocaleNamespace.Messages)} ${currentPage} ${getTranslation('list_command.builds_subcommand.builds_list_page.1', locale, ELocaleNamespace.Messages)} ${totalPages + 1}`)
        .setColor(role === 'Survivor' ? ThemeColors.SURVIVOR : ThemeColors.KILLER)
        .setDescription(getTranslation('list_command.builds_subcommand.builds_matching_filters', locale, ELocaleNamespace.Messages))
        .setTimestamp()
        .setFooter({ text: getTranslation('list_command.builds_subcommand.builds_list', locale, ELocaleNamespace.Messages) })
        .setThumbnail(combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_loadout.png'));

    for (const build of builds) {
        const index: number = builds.indexOf(build);
        const buildTitle = `${index + 1}. ${build.title} • ${getTranslation('list_command.builds_subcommand.created_by', locale, ELocaleNamespace.Messages)} ${build.username}`;

        const validPerks = [build.perk1, build.perk2, build.perk3, build.perk4]
            .filter(perk => perk && perk !== "None");

        const perkEmojiAndListPromises = validPerks.map(async(perkId) => {
            const perkDataEntry = perkData[perkId];
            if (!perkDataEntry) {
                return {
                    id: perkId,
                    listEntry: getTranslation(
                        'list_command.builds_subcommand.unknown_perk',
                        locale,
                        ELocaleNamespace.Messages
                    )
                };
            }

            const perkEmoji = await getApplicationEmoji(perkId);

            let listEntryWithEmoji;
            if (perkEmoji) {
                listEntryWithEmoji = perkEmoji;
            } else {
                const perkBuffer = await layerIcons(
                    Role[perkDataEntry.Role].perkBackground,
                    combineBaseUrlWithPath(perkDataEntry.IconFilePathList)
                ) as Buffer;
                listEntryWithEmoji = await getOrCreateApplicationEmoji(perkId, perkBuffer);
            }

            return {
                id: perkId,
                listEntry: listEntryWithEmoji
            };
        });

        const resolvedPerkData = await Promise.all(perkEmojiAndListPromises);

        const perksList = resolvedPerkData
            .map(({ listEntry }) => listEntry)
            .join(' ') || getTranslation('list_command.builds_subcommand.any_perks', locale, ELocaleNamespace.Messages);

        embed.addFields({
            name: buildTitle,
            value: perksList,
            inline: false
        });
    }

    return embed;
}

export function createStringMenu(builds: IBuild[], locale: Locale) {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('builds-selection')
        .setPlaceholder(getTranslation('list_command.builds_subcommand.select_for_details', locale, ELocaleNamespace.Messages))
        .addOptions(
            builds.map((build: IBuild, index: number) => ({
                label: `${index + 1}. ${build.title}`,
                description: `${getTranslation('list_command.builds_subcommand.created_by', locale, ELocaleNamespace.Messages)} ${build.username}`,
                value: build.buildId
            }))
        );

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
}

export function createLinkButton(locale: Locale) {
    const button = new ButtonBuilder()
        .setLabel(getTranslation('list_command.builds_subcommand.create_your_own_build', locale, ELocaleNamespace.Messages))
        .setStyle(ButtonStyle.Link)
        .setURL(combineBaseUrlWithPath('/builds/create'));

    return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
}