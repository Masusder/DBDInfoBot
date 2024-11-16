import {
    APIEmbedField,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder
} from "discord.js";
import { retrieveBuildById } from "@services/buildService";
import { getTranslation } from "@utils/localizationUtils";
import {
    adjustForTimezone,
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown
} from "@utils/stringUtils";
import { Role } from "@data/Role";
import {
    getCachedPerks
} from "@services/perkService";
import { getCachedItems } from "@services/itemService";
import { getCachedAddons } from "@services/addonService";
import { createLoadoutCanvas } from "@utils/imageUtils";
import { getCachedOfferings } from "@services/offeringService";

export async function handleBuildCommandInteraction(interaction: ChatInputCommandInteraction) {
    const buildId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!buildId) return;

    try {
        await interaction.deferReply();

        const [buildData, perkData, itemData, addonData, offeringData] = await Promise.all([
            retrieveBuildById(buildId),
            getCachedPerks(locale),
            getCachedItems(locale),
            getCachedAddons(locale),
            getCachedOfferings(locale)
        ]);

        if (!buildData || !perkData || !itemData || !addonData || !offeringData) {
            const message = "Not found any Build with specified ID."; // TODO: localize
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
            offering
        } = buildData;

        const roleColor = Role[role].hexColor;

        const perks = [perk1, perk2, perk3, perk4].filter(perk => perk !== "None");

        const fields: APIEmbedField[] = [];

        const perksPrettyList = perks
            .map(perk => `- ${perkData[perk]?.Name ?? '- Unknown Perk'}`); // TODO: localize

        fields.push({
            name: "Perks", // TODO: localize
            value: perksPrettyList.length ? perksPrettyList.join(' \n ') : "Any perks", // TODO: localize
            inline: true
        });


        const addons = [addon1, addon2].filter(addon => addon !== "None");
        const prettyAddons = addons.filter(Boolean)
            .map(addon => addonData[addon]?.Name ?? ' - Unknown Add-on') // TODO: localize
            .map(addon => ` - ${addon}`)
            .join(' \n ');
        if (role === 'Survivor') {
            const item = itemPower && itemPower !== "None" ? ` - ${itemData[itemPower].Name}` : "Any item"; // TODO: localize
            fields.push({
                name: "Item + Add-ons", // TODO: localize
                value: item + ' \n ' + prettyAddons,
                inline: true
            });
        } else if (role === 'Killer') {
            const power = itemPower && itemPower !== "None" ? ` - ${itemData[itemPower].Name}` : "Any power"; // TODO: localize

            fields.push({
                name: "Power + Add-ons", // TODO: localize
                value: power + ' \n ' + prettyAddons,
                inline: true
            });
        }

        const offeringPretty = offering && offering !== "None" ? offeringData[offering].Name : "Any offering"; // TODO: localize
        fields.push({
            name: "Offering", // TODO: localize
            value: offeringPretty,
            inline: true
        });

        const averageRating = Math.round(buildData.averageRating);
        const stars = '⭐'.repeat(averageRating) + '☆'.repeat(5 - averageRating);

        fields.push({
            name: "Rating", // TODO: localize
            value: `${stars} from a total of ${ratingCount} votes`, // TODO: localize
            inline: false
        });

        const creationDatePretty = new Date(adjustForTimezone(createdAt)).toLocaleDateString(locale, {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const formattedDescription = description ? description : "Description for this build wasn't provided."; // TODO: localize

        const embed = new EmbedBuilder()
            .setColor(roleColor)
            .setTitle(title)
            .setURL(combineBaseUrlWithPath(`/builds/${buildId}`))
            .setDescription(formattedDescription)
            .setImage('attachment://loadout.png')
            .setFields(fields)
            .setTimestamp()
            .setAuthor({
                name: 'Build Information', // TODO: localize
                iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_loadout.png')
            })
            .setFooter({
                text: `Created by ${username} on ${creationDatePretty}` // TODO: localize
            });

        // Send reply early without image, so user doesn't have to wait
        await interaction.editReply({ embeds: [embed] });

        const loadoutBuffer = await createLoadoutCanvas(role, locale, perks, itemPower, offering, addons);

        // Attach processed image
        await interaction.editReply({
            files: [{
                attachment: loadoutBuffer,
                name: 'loadout.png'
            }]
        });
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