import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder
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

        const { builds, totalPages } = await retrieveBuilds(filters);

        if (!builds || builds.length === 0) {
            return await interaction.editReply({ content: "No builds found with the specified filters." });
        }

        const perkData = await getCachedPerks(locale);

        const embed = await createEmbed(filters.role, builds, currentPage, totalPages, perkData, interaction.user.username);

        const replyMessage = await interaction.editReply({
            content: `For more information about a specific build, grab Build ID from list below and use the command: \`/info Build <build_id>\``,
            embeds: [embed],
            components: generatePaginationButtons(currentPage, totalPages + 1, locale)
        });

        const collector = replyMessage.createMessageComponentCollector({
            filter: (i): i is ButtonInteraction => i.isButton(),
            time: 60_000
        });

        collector.on('collect', async(i: ButtonInteraction) => {
            try {
                if (i.user.id !== interaction.user.id) {
                    await sendUnauthorizedMessage(i);
                    return;
                }

                const [_, paginationType, pageNumber] = i.customId.split('::');

                currentPage = determineNewPage(currentPage, paginationType as TPaginationType, totalPages + 1, pageNumber);

                const newFilters: IBuildFilters = { ...filters, page: currentPage - 1 };
                const { builds: newBuilds, totalPages: newTotalPages } = await retrieveBuilds(newFilters);

                if (!newBuilds || newBuilds.length === 0) {
                    return await i.update({ content: "No builds found with the specified filters.", components: [] });
                }

                const newEmbed = await createEmbed(filters.role, newBuilds, currentPage, newTotalPages, perkData, interaction.user.username);

                await i.update({
                    embeds: [newEmbed],
                    components: generatePaginationButtons(currentPage, totalPages + 1, locale)
                });
            } catch (error) {
                console.error("Error handling pagination:", error);
            }
        });

        collector.on('end', () => {
            try {
                replyMessage.edit({ components: [] });
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
    username: string) {
    const embed = new EmbedBuilder()
        .setTitle(`Build List - Page ${currentPage} of ${totalPages + 1}`)
        .setColor(role === 'Survivor' ? "#1e90ff" : "Red")
        .setDescription(`[You can create your own build here!](${combineBaseUrlWithPath('/builds/create')})\nHere are the builds matching your filters:`)
        .setTimestamp()
        .setFooter({ text: `Builds List | Requested by ${username}`, iconURL: undefined })
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
            value: `${perksList} \n\n Build ID: \`${build.buildId}\``,
            inline: false
        });
    });

    return embed;
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