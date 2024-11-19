import {
    APIEmbedField,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    StringSelectMenuInteraction
} from "discord.js";
import { retrieveBuildById } from "@services/buildService";
import { getTranslation } from "@utils/localizationUtils";
import {
    adjustForTimezone,
    combineBaseUrlWithPath
} from "@utils/stringUtils";
import { Role } from "@data/Role";
import { BuildCategories } from "@data/BuildCategories";
import { getCachedPerks } from "@services/perkService";
import { getCachedItems } from "@services/itemService";
import { getCachedAddons } from "@services/addonService";
import { createLoadoutCanvas } from "@utils/imageUtils";
import { getCachedOfferings } from "@services/offeringService";
import { getCachedCharacters } from "@services/characterService";

export async function handleBuildCommandInteraction(interaction: ChatInputCommandInteraction | StringSelectMenuInteraction) {
    const buildId = interaction.isChatInputCommand()
        ? interaction.options.getString('name')
        : interaction.values?.[0];
    const locale = interaction.locale;

    if (!buildId) return;

    try {
        if (interaction.isChatInputCommand()) {
            await interaction.deferReply();
        } else if (interaction.isStringSelectMenu()) {
            await interaction.deferUpdate();
        }

        const [buildData, perkData, itemData, addonData, offeringData, characterData] = await Promise.all([
            retrieveBuildById(buildId),
            getCachedPerks(locale),
            getCachedItems(locale),
            getCachedAddons(locale),
            getCachedOfferings(locale),
            getCachedCharacters(locale)
        ]);

        if (!buildData || !perkData || !itemData || !addonData || !offeringData) {
            const message = getTranslation('info_command.build_subcommand.build_not_found', locale, 'errors');
            await interaction.editReply({ content: message });
            return;
        }

        const {
            role,
            title,
            description,
            perk1,
            perk2,
            perk3,
            perk4,
            username,
            createdAt,
            ratingCount,
            itemPower,
            addon1,
            addon2,
            offering,
            category,
            character
        } = buildData;

        const roleColor = Role[role].hexColor;

        const perks = [perk1, perk2, perk3, perk4].filter(perk => perk !== "None");

        const fields: APIEmbedField[] = [];

        const perksPrettyList = perks
            .map(perk => `- ${perkData[perk]?.Name ?? `- ${getTranslation('info_command.build_subcommand.unknown_perk', locale, 'messages')}`}`);

        fields.push({
            name: getTranslation('info_command.build_subcommand.perks', locale, 'messages'),
            value: perksPrettyList.length ? perksPrettyList.join(' \n ') : getTranslation('info_command.build_subcommand.any_perks', locale, 'messages'),
            inline: true
        });

        const addons = [addon1, addon2].filter(addon => addon !== "None");
        const prettyAddons = addons.filter(Boolean)
            .map(addon => addonData[addon]?.Name ?? ` - ${getTranslation('info_command.build_subcommand.unknown_addon', locale, 'messages')}`)
            .map(addon => ` - ${addon}`)
            .join(' \n ');
        if (role === 'Survivor') {
            const item = itemPower && itemPower !== "None" ? ` - ${itemData[itemPower].Name}` : getTranslation('info_command.build_subcommand.any_item', locale, 'messages');
            fields.push({
                name: getTranslation('info_command.build_subcommand.item_addons', locale, 'messages'),
                value: item + ' \n ' + prettyAddons,
                inline: true
            });
        } else if (role === 'Killer') {
            const power = itemPower && itemPower !== "None" ? ` - ${itemData[itemPower].Name}` : getTranslation('info_command.build_subcommand.any_power', locale, 'messages');

            fields.push({
                name: getTranslation('info_command.build_subcommand.power_addons', locale, 'messages'),
                value: power + ' \n ' + prettyAddons,
                inline: true
            });
        }

        const offeringPretty = offering && offering !== "None" ? offeringData[offering].Name : getTranslation('info_command.build_subcommand.any_offering', locale, 'messages');
        fields.push({
            name: getTranslation('info_command.build_subcommand.offering', locale, 'messages'),
            value: offeringPretty,
            inline: true
        });

        const categoryPretty = BuildCategories[category];
        fields.push({
            name: getTranslation('info_command.build_subcommand.category', locale, 'messages'),
            value: getTranslation(categoryPretty, locale, 'general'),
            inline: true
        });

        const characterIndex = character != "None" ? parseInt(character) : -1;
        if (character && characterIndex !== -1) {
            fields.push({
                name: getTranslation('info_command.build_subcommand.character', locale, 'messages'),
                value: characterData[characterIndex].Name,
                inline: true
            });
        }

        const voteText = ratingCount && ratingCount > 1
            ? getTranslation('info_command.build_subcommand.votes', locale, 'messages')
            : getTranslation('info_command.build_subcommand.vote', locale, 'messages');

        const averageRating = Math.round(buildData.averageRating);
        const stars = '⭐'.repeat(averageRating) + '☆'.repeat(5 - averageRating);
        fields.push({
            name: getTranslation('info_command.build_subcommand.rating', locale, 'messages'),
            value: `${stars} ${getTranslation('info_command.build_subcommand.rating_desc', locale, 'messages')} ${ratingCount} ${voteText}`,
            inline: false
        });

        const creationDatePretty = new Date(adjustForTimezone(createdAt)).toLocaleDateString(locale, {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const formattedDescription = description ? description : getTranslation('info_command.build_subcommand.desc_not_provided', locale, 'messages');

        const embed = new EmbedBuilder()
            .setColor(roleColor)
            .setTitle(title)
            .setURL(combineBaseUrlWithPath(`/builds/${buildId}`))
            .setDescription(formattedDescription)
            .setImage('attachment://loadout.png')
            .setFields(fields)
            .setAuthor({
                name: getTranslation('info_command.build_subcommand.build_info', locale, 'messages'),
                iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_loadout.png')
            })
            .setFooter({
                text: `${getTranslation('info_command.build_subcommand.created_by.0', locale, 'messages')} ${username} ${getTranslation('info_command.build_subcommand.created_by.1', locale, 'messages')} ${creationDatePretty} | ID: ${buildId}`
            });

        if (characterIndex !== -1) {
            embed.setThumbnail(combineBaseUrlWithPath(characterData[characterIndex].IconFilePath));
        }

        // Send reply early without image, so user doesn't have to wait
        let followUpMsg = null as Message | null;
        if (interaction.isChatInputCommand()) {
            await interaction.editReply({ embeds: [embed] });
        } else {
            followUpMsg = await interaction.followUp({ embeds: [embed] });
        }

        const loadoutBuffer = await createLoadoutCanvas(role, locale, perks, itemPower, offering, addons);

        // Attach the processed image
        if (interaction.isChatInputCommand()) {
            await interaction.editReply({
                files: [{
                    attachment: loadoutBuffer,
                    name: 'loadout.png'
                }]
            });
        } else if (interaction.isStringSelectMenu()) {
            await followUpMsg?.edit({
                files: [{
                    attachment: loadoutBuffer,
                    name: 'loadout.png'
                }]
            });
        }
    } catch (error) {
        console.error("Error executing build subcommand:", error);
    }
}

export async function handleBuildCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        await interaction.respond([]); // We just let user input the ID
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}