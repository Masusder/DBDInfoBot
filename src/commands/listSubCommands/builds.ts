import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction
} from "discord.js";
import { getCharacterChoices } from "@services/characterService";
import {
    getCachedInclusionVersions,
    retrieveBuilds
} from "@services/buildService";
import { getCachedPerks } from "@services/perkService";
import {
    determineNewPage,
    generatePaginationButtons,
    TPaginationType
} from "../../handlers/genericPaginationHandler";
import { sendUnauthorizedMessage } from "../../handlers/unauthorizedHandler";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import {
    IBuild,
    IBuildFilters,
    Perk
} from "../../types";
import { handleBuildCommandInteraction } from "@commands/infoSubCommands/build";
import { getTranslation } from "@utils/localizationUtils";

export async function handleBuildsListCommandInteraction(interaction: ChatInputCommandInteraction) {
    let currentPage = interaction.options.getNumber('page') || 1;
    const locale = interaction.locale;

    const filters: IBuildFilters = {
        page: currentPage - 1,
        searchInput: interaction.options.getString('title') || null,
        category: interaction.options.getString('category') as IBuildFilters['category'],
        role: interaction.options.getString('role') as IBuildFilters['role'],
        character: interaction.options.getString('character') || null,
        version: interaction.options.getString('version') || null,
        rating: interaction.options.getNumber('rating') || null
    };

    try {
        await interaction.deferReply();

        const buildsList = await retrieveBuilds(filters);
        if (!buildsList) {
            return await interaction.editReply({ content: getTranslation('list_command.builds_subcommand.error_retrieving_data', locale, 'errors') });
        }

        const { builds, totalPages } = buildsList;

        if (!builds || builds.length === 0) {
            return await interaction.editReply({ content: getTranslation('list_command.builds_subcommand.builds_not_found_filters', locale, 'errors') });
        }

        const perkData = await getCachedPerks(locale);

        const embed = await createEmbed(filters.role, builds, currentPage, totalPages, perkData, locale);

        const stringMenu = createStringMenu(builds, locale);

        const replyMessage = await interaction.editReply({
            embeds: [embed],
            components: [stringMenu, ...generatePaginationButtons(currentPage, totalPages + 1, locale)]
        });

        const collector = replyMessage.createMessageComponentCollector({
            filter: (i): i is ButtonInteraction | StringSelectMenuInteraction => i.isButton() || i.isStringSelectMenu(),
            time: 60_000
        });

        collector.on('collect', async(i: ButtonInteraction | StringSelectMenuInteraction) => {
            try {
                if (i.user.id !== interaction.user.id) {
                    await sendUnauthorizedMessage(i);
                    return;
                }

                if (i.isButton()) {
                    const [_, paginationType, pageNumber] = i.customId.split('::');

                    currentPage = determineNewPage(currentPage, paginationType as TPaginationType, totalPages + 1, pageNumber);

                    const newFilters: IBuildFilters = { ...filters, page: currentPage - 1 };

                    const buildsList = await retrieveBuilds(newFilters);
                    if (!buildsList) return await i.update({ content: getTranslation('list_command.builds_subcommand.error_retrieving_data', locale, 'errors'), components: [] });

                    const { builds: newBuilds, totalPages: newTotalPages } = buildsList;

                    if (!newBuilds || newBuilds.length === 0) {
                        return await i.update({
                            content: getTranslation('list_command.builds_subcommand.builds_not_found_filters', locale, 'errors'),
                            components: []
                        });
                    }

                    const newEmbed = await createEmbed(filters.role, newBuilds, currentPage, newTotalPages, perkData, locale);

                    await i.update({
                        embeds: [newEmbed],
                        components: [createStringMenu(newBuilds, locale), ...generatePaginationButtons(currentPage, totalPages + 1, locale)]
                    });
                }

                // Handle select menu interactions
                if (i.isStringSelectMenu()) {
                    await handleBuildCommandInteraction(i);
                }
            } catch (error) {
                console.error("Error handling pagination:", error);
            }
        });

        collector.on('end', async() => {
            try {
                await replyMessage.edit({ components: [] });
            } catch (error) {
                console.error("Error handling pagination ('end' event):", error);
            }
        });
    } catch (error) {
        console.error("Error executing builds list subcommand:", error);
    }
}

// region Utils
async function createEmbed(
    role: 'Killer' | 'Survivor',
    builds: IBuild[],
    currentPage: number,
    totalPages: number,
    perkData: { [key: string]: Perk },
    locale: Locale) {
    const embed = new EmbedBuilder()
        .setTitle(`${getTranslation('list_command.builds_subcommand.builds_list', locale, 'messages')} - ${getTranslation('list_command.builds_subcommand.builds_list_page.0', locale, 'messages')} ${currentPage} ${getTranslation('list_command.builds_subcommand.builds_list_page.1', locale, 'messages')} ${totalPages + 1}`)
        .setColor(role === 'Survivor' ? "#1e90ff" : "Red")
        .setDescription(`[${getTranslation('list_command.builds_subcommand.create_your_own_build', locale, 'messages')}](${combineBaseUrlWithPath('/builds/create')})\n${getTranslation('list_command.builds_subcommand.builds_matching_filters', locale, 'messages')}`)
        .setTimestamp()
        .setFooter({ text: getTranslation('list_command.builds_subcommand.builds_list', locale, 'messages') })
        .setThumbnail(combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_loadout.png'));

    builds.forEach((build: IBuild, index: number) => {
        const buildTitle = `${index + 1}. ${build.title} | ${getTranslation('list_command.builds_subcommand.created_by', locale, 'messages')} ${build.username}`;

        const perksList = [build.perk1, build.perk2, build.perk3, build.perk4]
            .filter(Boolean)
            .filter(perk => perk !== "None")
            .map(perk => `${perkData[perk]?.Name ?? getTranslation('list_command.builds_subcommand.unknown_perk', locale, 'messages')}`)
            .join(', ') || getTranslation('list_command.builds_subcommand.any_perks', locale, 'messages');

        embed.addFields({
            name: buildTitle,
            value: perksList,
            inline: false
        });
    });

    return embed;
}

function createStringMenu(builds: IBuild[], locale: Locale) {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('builds-selection')
        .setPlaceholder(getTranslation('list_command.builds_subcommand.select_for_details', locale, 'messages'))
        .addOptions(
            builds.map((build: IBuild, index: number) => ({
                label: `${index + 1}. ${build.title}`,
                description: `${getTranslation('list_command.builds_subcommand.created_by', locale, 'messages')} ${build.username}`,
                value: build.buildId
            }))
        );

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
}

// endregion

// region Autocomplete
export async function handleBuildsListCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const focusedOption = interaction.options.getFocused(true);
        switch (focusedOption.name) {
            case 'character':
                await autocompleteCharacter(interaction);
                break;
            case 'inclusion_version':
                await autocompleteInclusionVersion(interaction);
                break;
            default:
                break;
        }
    } catch (error) {
        console.error("Error handling cosmetic list autocomplete interaction:", error);
    }
}

export async function autocompleteCharacter(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused();
        const role = interaction.options.getString('role');
        const choices = await getCharacterChoices(focusedValue, locale);

        const filteredChoices = choices.filter(character => {
            return !role || character.Role === role;
        });

        const options = filteredChoices.slice(0, 25).map(character => ({
            name: character.Name,
            value: character.CharacterIndex!
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}

export async function autocompleteInclusionVersion(interaction: AutocompleteInteraction) {
    try {
        const focusedValue = interaction.options.getFocused();
        const inclusionVersions = await getCachedInclusionVersions();
        const filteredVersions = inclusionVersions.sort().reverse().filter(version =>
            version.toLowerCase().includes(focusedValue.toLowerCase())
        );
        const options = filteredVersions.slice(0, 25).map(inclusionVersion => ({
            name: inclusionVersion,
            value: inclusionVersion
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}

// endregion