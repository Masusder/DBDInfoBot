import {
    APIEmbedField,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    StringSelectMenuInteraction
} from "discord.js";
import { retrieveBuildById } from "@services/buildService";
import { t } from "@utils/localizationUtils";
import {
    adjustForTimezone,
    combineBaseUrlWithPath
} from "@utils/stringUtils";
import { Role } from "@data/Role";
import { BuildCategories } from "@data/BuildCategories";
import { getCachedPerks } from "@services/perkService";
import { getCachedItems } from "@services/itemService";
import { getCachedAddons } from "@services/addonService";
import {
    createLoadoutCanvas,
    layerIcons
} from "@utils/imageUtils";
import { getCachedOfferings } from "@services/offeringService";
import { getCachedCharacters } from "@services/characterService";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { sendErrorMessage } from "@handlers/errorResponseHandler";

// region Interaction Handlers
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
            if (!interaction.deferred) await interaction.deferUpdate();
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
            const message = t('info_command.build_subcommand.build_not_found', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
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
            .map(perk => `- ${perkData[perk]?.Name ?? `- ${t('info_command.build_subcommand.unknown_perk', locale, ELocaleNamespace.Messages)}`}`);

        fields.push({
            name: t('info_command.build_subcommand.perks', locale, ELocaleNamespace.Messages),
            value: perksPrettyList.length ? perksPrettyList.join(' \n ') : t('info_command.build_subcommand.any_perks', locale, ELocaleNamespace.Messages),
            inline: true
        });

        const addons = [addon1, addon2].filter(addon => addon !== "None");
        const prettyAddons = addons.filter(Boolean)
            .map(addon => addonData[addon]?.Name ?? ` - ${t('info_command.build_subcommand.unknown_addon', locale, ELocaleNamespace.Messages)}`)
            .map(addon => ` - ${addon}`)
            .join(' \n ');
        if (role === 'Survivor') {
            const item = itemPower && itemPower !== "None" ? ` - ${itemData[itemPower].Name}` : t('info_command.build_subcommand.any_item', locale, ELocaleNamespace.Messages);
            fields.push({
                name: t('info_command.build_subcommand.item_addons', locale, ELocaleNamespace.Messages),
                value: item + ' \n ' + prettyAddons,
                inline: true
            });
        } else if (role === 'Killer') {
            const power = itemPower && itemPower !== "None" ? ` - ${itemData[itemPower].Name}` : t('info_command.build_subcommand.any_power', locale, ELocaleNamespace.Messages);

            fields.push({
                name: t('info_command.build_subcommand.power_addons', locale, ELocaleNamespace.Messages),
                value: power + ' \n ' + prettyAddons,
                inline: true
            });
        }

        const offeringPretty = offering && offering !== "None" ? offeringData[offering].Name : t('info_command.build_subcommand.any_offering', locale, ELocaleNamespace.Messages);
        fields.push({
            name: t('info_command.build_subcommand.offering', locale, ELocaleNamespace.Messages),
            value: offeringPretty,
            inline: true
        });

        const categoryPretty = BuildCategories[category];
        fields.push({
            name: t('info_command.build_subcommand.category', locale, ELocaleNamespace.Messages),
            value: t(categoryPretty, locale, ELocaleNamespace.General),
            inline: true
        });

        const characterIndex = character != "None" ? parseInt(character) : -1;
        if (character && characterIndex !== -1) {
            fields.push({
                name: t('info_command.build_subcommand.character', locale, ELocaleNamespace.Messages),
                value: characterData[characterIndex].Name,
                inline: true
            });
        }

        if (ratingCount !== undefined) {
            const averageRating = Math.round(buildData.averageRating);
            const stars = '⭐'.repeat(averageRating) + '☆'.repeat(5 - averageRating);
            fields.push({
                name: t('info_command.build_subcommand.rating', locale, ELocaleNamespace.Messages),
                value: `${stars} ${t('info_command.build_subcommand.rating_desc', locale, ELocaleNamespace.Messages, { votes_count: ratingCount?.toString() })}`,
                inline: false
            });
        }

        const creationDatePretty = new Date(adjustForTimezone(createdAt)).toLocaleDateString(locale, {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const formattedDescription = description ? description : t('info_command.build_subcommand.desc_not_provided', locale, ELocaleNamespace.Messages);

        const embed = new EmbedBuilder()
            .setColor(roleColor)
            .setTitle(title)
            .setURL(combineBaseUrlWithPath(`/builds/${buildId}`))
            .setDescription(formattedDescription)
            .setImage('attachment://loadout.png')
            .setFields(fields)
            .setAuthor({
                name: t('info_command.build_subcommand.build_info', locale, ELocaleNamespace.Messages),
                iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_loadout.png')
            })
            .setFooter({
                text: `${t('info_command.build_subcommand.created_by', locale, ELocaleNamespace.Messages, {
                    username,
                    date: creationDatePretty
                })} | ID: ${buildId}`
            });

        let charPortraitBuffer: Buffer | null = null;
        if (characterIndex !== -1) {
            const characterBackgroundUrl = Role[role].charPortrait;
            charPortraitBuffer = await layerIcons(characterBackgroundUrl, combineBaseUrlWithPath(characterData[characterIndex].IconFilePath)) as Buffer
            embed.setThumbnail(`attachment://characterImage_${characterIndex}.png`);
        }

        // Send reply early without image, so user doesn't have to wait
        let followUpMsg = null as Message | null;
        if (interaction.isChatInputCommand()) {
            await interaction.editReply({
                embeds: [embed],
                files: charPortraitBuffer ? [
                    {
                        attachment: charPortraitBuffer,
                        name: `characterImage_${characterIndex}.png`
                    }
                ] : []
            });
        } else {
            followUpMsg = await interaction.followUp({
                embeds: [embed],
                files: charPortraitBuffer ? [
                    {
                        attachment: charPortraitBuffer,
                        name: `characterImage_${characterIndex}.png`
                    }
                ] : []
            });
        }

        const loadoutBuffer = await createLoadoutCanvas(role, locale, perks, itemPower, offering, addons);

        const attachments = createAttachments(charPortraitBuffer, loadoutBuffer, characterIndex);

        // Attach the processed image
        if (interaction.isChatInputCommand()) {
            await interaction.editReply({
                files: attachments
            });
        } else if (interaction.isStringSelectMenu()) {
            await followUpMsg?.edit({
                files: attachments
            });
        }
    } catch (error) {
        console.error("Error executing build subcommand:", error);
    }
}

// endregion

// region Autocomplete
export async function handleBuildCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        await interaction.respond([]); // We just let user input the ID
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}

// endregion

// region Utils
const createAttachments = (charPortraitBuffer: Buffer | null, loadoutBuffer: Buffer | null, characterIndex: number) => {
    const attachments: { attachment: Buffer, name: string }[] = [];

    if (charPortraitBuffer) {
        attachments.push({
            attachment: charPortraitBuffer,
            name: `characterImage_${characterIndex}.png`
        });
    }

    if (loadoutBuffer) {
        attachments.push({
            attachment: loadoutBuffer,
            name: 'loadout.png'
        });
    }

    return attachments;
};

// endregion