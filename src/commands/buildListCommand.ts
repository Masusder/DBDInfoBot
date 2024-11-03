import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    ButtonInteraction,
    AutocompleteInteraction
} from "discord.js";
import { IBuild, IBuildFilters } from "../types/build";
import { getCachedInclusionVersions, retrieveBuilds } from "../services/buildService";
import { getCachedCharacters, getCharacterChoices } from "../services/characterService";
import { generatePaginationButtons } from "../handlers/paginationHandler";
import { BuildCategories } from "../data/BuildCategories";
import { Character, Perk, Addon, Offering } from "../types";
import { getCachedPerks } from "../services/perkService";
import { combineBaseUrlWithPath } from "../utils/stringUtils";
import { getCachedAddons } from "../services/addonService";
import { getCachedOfferings } from "../services/offeringService";

export const data = new SlashCommandBuilder()
    .setName('build_list')
    .setDescription('Search for builds')
    .addStringOption(option =>
        option
            .setName('role')
            .setDescription('Role for the build')
            .setRequired(true)
            .addChoices(
                { name: 'Killer', value: 'Killer' },
                { name: 'Survivor', value: 'Survivor' }
            )
    )
    .addNumberOption(option =>
        option
            .setName('page')
            .setDescription('Page number (default is 1)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(9999)
    )
    .addStringOption(option =>
        option
            .setName('title')
            .setDescription('Title of the build')
            .setRequired(false)
    )
    .addStringOption(option =>
        option
            .setName('category')
            .setDescription('Category of the build')
            .setRequired(false)
            .addChoices(
                ...Object.entries(BuildCategories).map(([value, name]) => ({ name, value }))
            )
    )
    .addStringOption(option =>
        option
            .setName('character')
            .setDescription('Character for the build')
            .setRequired(false)
            .setAutocomplete(true)
    )
    .addStringOption(option =>
        option
            .setName('version')
            .setDescription('Game version for the build')
            .setRequired(false)
            .setAutocomplete(true)
    )
    .addNumberOption(option =>
        option
            .setName('rating')
            .setDescription('Minimum rating for the build')
            .setRequired(false)
            .addChoices(
                { name: "One Star", value: 1 },
                { name: "Two Stars", value: 2 },
                { name: "Three Stars", value: 3 },
                { name: "Four Stars", value: 4 },
                { name: "Five Stars", value: 5 }
            )
    );

async function createEmbed(
    role: 'Killer' | 'Survivor',
    builds: IBuild[],
    currentPage: number,
    totalPages: number,
    characterData: { [key: string]: Character },
    perkData: { [key: string]: Perk },
    addonData: { [key: string]: Addon },
    offeringData: { [key: string]: Offering },
    username: string) {
    const embed = new EmbedBuilder()
        .setTitle(`Build List - Page ${currentPage} of ${totalPages}`)
        .setColor(role === 'Survivor' ? "#1e90ff" : "Red")
        .setDescription(`Here are the builds matching your filters: \n[You can create your own build here](${combineBaseUrlWithPath('/builds/create')})`)
        .setTimestamp()
        .setFooter({ text: `Builds List | Requested by ${username}`, iconURL: undefined })
        .setThumbnail(combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_loadout.png'));

    builds.forEach((build: IBuild) => {
        const buildTitle = `${build.title} | Created by: ${build.username}`;
        const characterName = characterData[build.character]?.Name ?? 'N/A';

        const perksList = [build.perk1, build.perk2, build.perk3, build.perk4]
            .filter(Boolean)
            .filter(perk => perk !== "None")
            .map(perk => perkData[perk]?.Name ?? 'Unknown Perk')
            .map(perk => ` - ${perk}`)
            .join(' \n ') || '  - None';

        const addonsList = [build.addon1, build.addon2]
            .filter(Boolean)
            .filter(addon => addon !== "None")
            .map(addon => addonData[addon]?.Name ?? 'Unknown Addon')
            .map(addon => ` - ${addon}`)
            .join(' \n ') || '  - None';

        const averageRating = Math.round(build.averageRating);
        const offering = build.offering && build.offering !== "None"
            ? `  - ${offeringData[build.offering]?.Name ?? 'Unknown Offering'}`
            : '  - None';

        const stars = '⭐'.repeat(averageRating) + '☆'.repeat(5 - averageRating);
        const truncatedDescription = build.description
            ? (build.description.length > 75 ? build.description.slice(0, 75) + '..' : build.description)
            : 'No description available.';

        const detailsUrl = combineBaseUrlWithPath(`/builds/${build.buildId}`);

        embed.addFields({
            name: buildTitle,
            value: `- **Role**: ${build.role} \n` +
                `- **Category**: ${BuildCategories[build.category]} \n` +
                `- **Character**: ${characterName} \n` +
                `- **Perks**: \n ${perksList} \n` +
                `- **Addons**: \n ${addonsList} \n` +
                `- **Offering**: \n ${offering} \n` +
                `- **Rating**: ${averageRating} ${stars} Voted by: ${build.ratingCount} user(s) \n` +
                `- **Description:** ${truncatedDescription} \n` +
                `[Click for more build details..](${detailsUrl})\n\u200B\n`,
            inline: false
        });
    });

    return embed;
}

export async function execute(interaction: ChatInputCommandInteraction) {
    let currentPage = interaction.options.getNumber('page') || 1;

    const filters: IBuildFilters = {
        page: currentPage,
        searchInput: interaction.options.getString('title') || null,
        category: interaction.options.getString('category') as IBuildFilters['category'],
        role: interaction.options.getString('role') as IBuildFilters['role'],
        character: interaction.options.getString('character') || null,
        version: interaction.options.getString('version') || null,
        rating: interaction.options.getNumber('rating') || null
    };

    await interaction.deferReply();

    try {
        const { builds, totalPages } = await retrieveBuilds(filters);

        if (!builds || builds.length === 0) {
            return await interaction.editReply({ content: "No builds found with the specified filters." });
        }

        const characterData = await getCachedCharacters();
        const perkData = await getCachedPerks();
        const addonData = await getCachedAddons();
        const offeringData = await getCachedOfferings();
        const embed = await createEmbed(filters.role, builds, currentPage, totalPages, characterData, perkData, addonData, offeringData, interaction.user.username);

        const replyMessage = await interaction.editReply({
            embeds: [embed],
            components: [generatePaginationButtons(currentPage, totalPages)]
        });

        const collector = replyMessage.createMessageComponentCollector({
            filter: (i): i is ButtonInteraction => i.isButton() && i.user.id === interaction.user.id,
            time: 60_000
        });

        collector.on('collect', async i => {
            const [_, paginationType] = i.customId.split('::');

            if (paginationType === 'first') currentPage = 1;
            else if (paginationType === 'previous') currentPage = Math.max(1, currentPage - 1);
            else if (paginationType === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else if (paginationType === 'last') currentPage = totalPages;

            const newFilters: IBuildFilters = { ...filters, page: currentPage };
            const { builds: newBuilds, totalPages: newTotalPages } = await retrieveBuilds(newFilters);

            if (!newBuilds || newBuilds.length === 0) {
                return await i.update({ content: "No builds found with the specified filters.", components: [] });
            }

            const newEmbed = await createEmbed(filters.role, newBuilds, currentPage, newTotalPages, characterData, perkData, addonData, offeringData, interaction.user.username);

            await i.update({
                embeds: [newEmbed],
                components: [generatePaginationButtons(currentPage, totalPages)]
            });
        });

        collector.on('end', () => {
            replyMessage.edit({ components: [] });
        });
    } catch (error) {
        console.error("Error executing build_list command:", error);
    }
}

// region Autocomplete
export async function autocompleteCharacter(interaction: AutocompleteInteraction) {
    try {
        const focusedValue = interaction.options.getFocused();
        const role = interaction.options.getString('role');
        const choices = await getCharacterChoices(focusedValue);

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
        const filteredVersions = inclusionVersions.filter(version =>
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