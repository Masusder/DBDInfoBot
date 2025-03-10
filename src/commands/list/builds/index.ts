import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
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
} from "@handlers/paginationHandler";
import { sendUnauthorizedMessage } from "@handlers/unauthorizedHandler";
import { IBuildFilters } from "@tps/index";
import { handleBuildCommandInteraction } from "@commands/info/build";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import {
    createEmbed,
    createLinkButton,
    createStringMenu
} from "./utils";

// region Interaction Handlers
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
            return await interaction.editReply({ content: t('list_command.builds_subcommand.error_retrieving_data', locale, ELocaleNamespace.Errors) });
        }

        const { builds, totalPages } = buildsList;

        if (!builds || builds.length === 0) {
            return await interaction.editReply({ content: t('list_command.builds_subcommand.builds_not_found_filters', locale, ELocaleNamespace.Errors) });
        }

        const perkData = await getCachedPerks(locale);

        const embed = await createEmbed(filters.role, builds, currentPage, totalPages, perkData, locale);

        const stringMenu = createStringMenu(builds, locale);
        const linkButton = createLinkButton(locale);

        const replyMessage = await interaction.editReply({
            embeds: [embed],
            components: [stringMenu, ...generatePaginationButtons(currentPage, totalPages + 1, locale), linkButton]
        });

        const collector = replyMessage.createMessageComponentCollector({
            filter: (i): i is ButtonInteraction | StringSelectMenuInteraction => i.isButton() || i.isStringSelectMenu(),
            time: 60_000
        });

        collector.on('collect', async(i: ButtonInteraction | StringSelectMenuInteraction) => {
            try {
                await i.deferUpdate();
                if (i.user.id !== interaction.user.id) {
                    await sendUnauthorizedMessage(i);
                    return;
                }

                if (i.isButton()) {
                    const [_, paginationType, pageNumber] = i.customId.split('::');

                    currentPage = determineNewPage(currentPage, paginationType as TPaginationType, totalPages + 1, pageNumber);

                    const newFilters: IBuildFilters = { ...filters, page: currentPage - 1 };

                    const buildsList = await retrieveBuilds(newFilters);
                    if (!buildsList) return await i.update({
                        content: t('list_command.builds_subcommand.error_retrieving_data', locale, ELocaleNamespace.Errors),
                        components: []
                    });

                    const { builds: newBuilds, totalPages: newTotalPages } = buildsList;

                    if (!newBuilds || newBuilds.length === 0) {
                        return await i.editReply({
                            content: t('list_command.builds_subcommand.builds_not_found_filters', locale, ELocaleNamespace.Errors),
                            components: []
                        });
                    }

                    const newEmbed = await createEmbed(filters.role, newBuilds, currentPage, newTotalPages, perkData, locale);

                    await i.editReply({
                        embeds: [newEmbed],
                        components: [createStringMenu(newBuilds, locale), ...generatePaginationButtons(currentPage, totalPages + 1, locale), linkButton]
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
                await replyMessage.edit({ components: [linkButton] });
            } catch (error) {
                console.error("Error handling pagination ('end' event):", error);
            }
        });
    } catch (error) {
        console.error("Error executing builds list subcommand:", error);
    }
}

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