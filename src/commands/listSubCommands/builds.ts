import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
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

// TODO: localize this
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
            return await interaction.editReply({ content: "Failed to retrieve builds data." });
        }

        const { builds, totalPages } = buildsList;

        if (!builds || builds.length === 0) {
            return await interaction.editReply({ content: "No builds found with the specified filters." });
        }

        const perkData = await getCachedPerks(locale);

        const embed = await createEmbed(filters.role, builds, currentPage, totalPages, perkData);

        const stringMenu = createStringMenu(builds);

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
                    if (!buildsList) return await i.update({ content: "Failed to retrieve builds data.", components: [] });

                    const { builds: newBuilds, totalPages: newTotalPages } = buildsList;

                    if (!newBuilds || newBuilds.length === 0) {
                        return await i.update({
                            content: "No builds found with the specified filters.",
                            components: []
                        });
                    }

                    const newEmbed = await createEmbed(filters.role, newBuilds, currentPage, newTotalPages, perkData);

                    await i.update({
                        embeds: [newEmbed],
                        components: [createStringMenu(newBuilds), ...generatePaginationButtons(currentPage, totalPages + 1, locale)]
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
    perkData: { [key: string]: Perk }) {
    const embed = new EmbedBuilder()
        .setTitle(`Build List - Page ${currentPage} of ${totalPages + 1}`)
        .setColor(role === 'Survivor' ? "#1e90ff" : "Red")
        .setDescription(`[You can create your own build here!](${combineBaseUrlWithPath('/builds/create')})\nHere are the builds matching your filters:`)
        .setTimestamp()
        .setFooter({ text: 'Builds List' })
        .setThumbnail(combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_loadout.png'));

    builds.forEach((build: IBuild, index: number) => {
        const buildTitle = `${index + 1}. ${build.title} | Created by: ${build.username}`;

        const perksList = [build.perk1, build.perk2, build.perk3, build.perk4]
            .filter(Boolean)
            .filter(perk => perk !== "None")
            .map(perk => `${perkData[perk]?.Name ?? 'Unknown Perk'}`)
            .join(', ') || 'Any Perks';

        embed.addFields({
            name: buildTitle,
            value: perksList,
            inline: false
        });
    });

    return embed;
}

function createStringMenu(builds: any) {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('builds-selection')
        .setPlaceholder('Select a build to get details')
        .addOptions(
            builds.map((build: IBuild, index: number) => ({
                label: `${index + 1}. ${build.title}`,
                description: `Created by: ${build.username}`,
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