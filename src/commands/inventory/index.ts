import i18next from "i18next";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
    commandLocalizationHelper,
    t
} from "@utils/localizationUtils";
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale,
    User
} from "discord.js";
import axios from "axios";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import { CombinedSchema } from "@commands/inventory/schemas";
import { InventoryItem } from "@commands/inventory/schemas/inventorySchema";
import { DbdRatingsItem } from "@commands/inventory/schemas/ratingsSchema";
import { DbdCharacterItem } from "@commands/inventory/schemas/characterDataSchema";
import {
    combineBaseUrlWithPath,
    isValidData
} from "@utils/stringUtils";
import {
    getCachedCharacters,
    getCharacterChoices
} from "@services/characterService";
import { renderBrowserBuffer } from "@utils/ssrUtility";
import { getCachedPerks } from "@services/perkService";
import { getCachedCosmetics } from "@services/cosmeticService";
import { getCachedOfferings } from "@services/offeringService";
import { getCachedAddons } from "@services/addonService";
import { getCachedItems } from "@services/itemService";
import { ConsumedCellsItem } from "@commands/inventory/schemas/consumedCellsSchema";
import { GameData } from "@ui/components/DbdInventory/models";
import { DbdPlayerName } from "@commands/inventory/schemas/playerNameSchema";
import DbdInventory from "@ui/components/DbdInventory/DbdInventory";
import Constants from "@constants";
import { Role } from "@data/Role";
import { layerIcons } from "@utils/imageUtils";
import { Character } from "@tps/character";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('inventory')
        .setNameLocalizations(commandLocalizationHelper('inventory_command.name'))
        .setDescription(i18next.t('inventory_command.description', { lng: 'en' }))
        .setDescriptionLocalizations(commandLocalizationHelper('inventory_command.description'))
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1])
        .addAttachmentOption(option =>
            option
                .setName("file")
                .setNameLocalizations(commandLocalizationHelper('inventory_command.options.file.name'))
                .setDescription(i18next.t('inventory_command.options.file.description', { lng: 'en' }))
                .setDescriptionLocalizations(commandLocalizationHelper('inventory_command.options.file.description'))
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('character')
                .setNameLocalizations(commandLocalizationHelper('inventory_command.options.character.name'))
                .setDescription(i18next.t('inventory_command.options.character.description', { lng: 'en' }))
                .setDescriptionLocalizations(commandLocalizationHelper('inventory_command.options.character.description'))
                .setRequired(true)
                .setAutocomplete(true)
        )
    : undefined;


export async function execute(interaction: ChatInputCommandInteraction) {
    const characterIndex = interaction.options.getString('character');
    const locale = interaction.locale;

    if (!characterIndex) return;

    try {
        await interaction.deferReply();

        const file = interaction.options.getAttachment("file");

        if (!file) {
            await sendErrorMessage(interaction, t('inventory_command.upload_valid_file', locale, ELocaleNamespace.Errors), {
                url: Constants.DBDINFO_BASE_URL,
                label: t('inventory_command.support', locale, ELocaleNamespace.Messages)
            })
            return;
        } // TODO: localize

        const response = await axios(file.url);
        const validationResult = CombinedSchema.safeParse(response.data);

        if (!validationResult.success) {
            await sendErrorMessage(interaction, t('inventory_command.invalid_data', locale, ELocaleNamespace.Errors), {
                url: Constants.DBDINFO_BASE_URL,
                label: t('inventory_command.support', locale, ELocaleNamespace.Messages)
            }) // TODO: localize
            return;
        }

        const validatedData = validationResult.data;

        let inventoryItems: InventoryItem[] = [];
        let dbdRatings: DbdRatingsItem[] = [];
        let userCharacterData: DbdCharacterItem[] = [];
        let consumedCells: ConsumedCellsItem[] = [];
        let playerName: DbdPlayerName | null = null;

        let isGDPR = false;

        if ("UEParser" in validatedData) {
            const UEParserData = validatedData.UEParser;
            inventoryItems = UEParserData.playerInventory;

            userCharacterData = UEParserData.splinteredState?.dbd_character_data || [];
            playerName = UEParserData.playerName;
        } else if ("gdpr" in validatedData) {
            const gdprData = validatedData.gdpr;
            inventoryItems = gdprData.playerInventory;

            if (gdprData.splinteredState) {
                dbdRatings = gdprData.splinteredState["dbd-ratings"] || [];
                userCharacterData = gdprData.splinteredState["dbd_character_data"] || [];
                consumedCells = gdprData.splinteredState["dbd-consume-cells"] || [];
                playerName = gdprData.playerName;

                isGDPR = true;
            }
        }

        const [characterData, perkData, cosmeticData, offeringData, addonData, itemData] = await Promise.all([
            getCachedCharacters(locale),
            getCachedPerks(locale),
            getCachedCosmetics(locale),
            getCachedOfferings(locale),
            getCachedAddons(locale),
            getCachedItems(locale)
        ]);

        if (!isValidData(characterData) || !isValidData(perkData) || !isValidData(cosmeticData) || !isValidData(offeringData) || !isValidData(addonData) || !isValidData(itemData) || !playerName) {
            await sendErrorMessage(interaction, t('inventory_command.game_data_not_found', locale, ELocaleNamespace.Errors)) // TODO: localize
            return;
        }

        const gameData: GameData = {
            characterData,
            perkData,
            cosmeticData,
            offeringData,
            addonData,
            itemData
        }

        const character = characterData[characterIndex]

        const embed = new EmbedBuilder()
            .setColor(Role[character.Role].hexColor)
            .setTitle(t('inventory_command.inventory_overview', locale, ELocaleNamespace.Messages, {
                character_name: characterData[characterIndex].Name
            })) // TODO: localize
            .setDescription(t('inventory_command.description', locale, ELocaleNamespace.Messages)) // TODO: localize
            .setThumbnail(`attachment://characterImage_${characterIndex}.png`)
            .setTimestamp()
            .setImage(`attachment://dbdInventory_${playerName.userId}.png`)
            .setAuthor({
                name: playerName.playerName,
                iconURL: interaction.user.avatarURL() || ' ',
            });

        const charPortraitBuffer = await generateCharacterPortrait(character);
        const dbdInventoryBuffer = await generateDbdInventory(inventoryItems, userCharacterData, dbdRatings, consumedCells, playerName, characterIndex, isGDPR, gameData, interaction.user, locale);

        if (!dbdInventoryBuffer) {
            await sendErrorMessage(interaction, t('inventory_command.failed_generating', locale, ELocaleNamespace.Errors)); // TODO: localize
            return;
        }

        await interaction.editReply({
            embeds: [embed],
            files: [
                {
                    attachment: charPortraitBuffer,
                    name: `characterImage_${characterIndex}.png`
                },
                {
                    attachment: dbdInventoryBuffer,
                    name: `dbdInventory_${playerName.userId}.png`
                }]
        });
    } catch (error) {
        console.error("Error executing inventory command:", error);
        await sendErrorMessage(interaction, t('inventory_command.fatal_error', locale, ELocaleNamespace.Errors)); // TODO: localize
    }
}

async function generateDbdInventory(
    inventory: InventoryItem[],
    userCharacterData: DbdCharacterItem[],
    ratings: DbdRatingsItem[],
    consumedCells: ConsumedCellsItem[],
    playerName: DbdPlayerName | null,
    characterIndex: string,
    isGDPR: boolean,
    gameData: GameData,
    user: User,
    locale: Locale
): Promise<Buffer | null> {
    try {
        const props = {
            inventory,
            userCharacterData,
            ratings,
            consumedCells,
            gameData,
            characterIndex,
            playerName,
            isGDPR,
            locale,
            user
        };

        return renderBrowserBuffer(DbdInventory, 'src/ui/components/DbdInventory/DbdInventory.css', 1634, 899, props);
    } catch (error) {
        console.error("Failed generating dbd inventory infographic.", error);
        return null;
    }
}

async function generateCharacterPortrait(character: Character) {
    const role = character.Role as 'Killer' | 'Survivor';
    const roleData = Role[role];

    const characterBackgroundUrl = roleData.charPortrait;
    const characterIconUrl = combineBaseUrlWithPath(character.IconFilePath);

    return await layerIcons(characterBackgroundUrl, characterIconUrl) as Buffer;
}

// region Autocomplete
export async function autocomplete(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused();
        const choices = await getCharacterChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(character => ({
            name: character.Name,
            value: character.CharacterIndex!
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}

// endregion