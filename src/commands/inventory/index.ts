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
import { ThemeColors } from "@constants/themeColors";
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

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('inventory') // TODO: localize
        .setDescription("Check your in-game inventory for given character in form of an infographic.") // TODO: localize
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1])
        .addAttachmentOption(option =>
            option
                .setName("file")
                .setDescription("Attach your inventory file. You can learn how to obtain it on support server.") // TODO: localize
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('character')
                .setNameLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.character.name')) // TODO: localize
                .setDescription(i18next.t('list_command.builds_subcommand.options.character.description', { lng: 'en' })) // TODO: localize
                .setDescriptionLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.character.description')) // TODO: localize
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

        if (!file) return await sendErrorMessage(interaction, "Please upload a valid JSON file.") // TODO: localize

        const response = await axios(file.url);
        // const validationResult = InventoryRootSchema.safeParse(response.data);
        const validationResult = CombinedSchema.safeParse(response.data);
        console.log(response.data)
        if (!validationResult.success) {
            const errors = validationResult.error.errors;
            console.log(errors)
            errors.forEach((err) => {
                console.error(`Path: ${err.path.join('.')}`);
                console.error(`Expected: ${err.message}`);
            });

            await sendErrorMessage(interaction, "This data is invalid. Check our support server to learn how to obtain it.", {
                url: "https://discord.gg/dbdleaks",
                label: "Support"
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

        if (!isValidData(characterData) || !isValidData(perkData) || !isValidData(cosmeticData) || !isValidData(offeringData) || !isValidData(addonData) || !isValidData(itemData)) {
            console.warn("Game data not found. Failed to render dbd inventory.");
            return null; // TODO: respond with error handler
        }

        const gameData: GameData = {
            characterData,
            perkData,
            cosmeticData,
            offeringData,
            addonData,
            itemData
        }

        const embed = new EmbedBuilder()
            .setColor(ThemeColors.PRIMARY)
            .setTitle(`${characterData[characterIndex].Name} - Inventory Overview`)
            .setDescription("A detailed summary of the inventory for the selected character.")
            .setTimestamp()
            .setImage(`attachment://dbdInventory.png`)
            .setThumbnail(combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_DBDlogo.png'))
            .setAuthor({
                name: interaction.user.displayName,
                iconURL: interaction.user.avatarURL() || '',
            });

        const dbdInventoryBuffer = await generateDbdInventory(inventoryItems, userCharacterData, dbdRatings, consumedCells, playerName, characterIndex, isGDPR, gameData, interaction.user, locale);

        if (!dbdInventoryBuffer) {
            return; // TODO: respond with error handler
        }

        await interaction.editReply({
            embeds: [embed],
            files: [{
                attachment: dbdInventoryBuffer,
                name: `dbdInventory.png`
            }]
        });
    } catch (error) {
        console.error("Error executing inventory command:", error);
        await sendErrorMessage(interaction, "Fatal error occurred while executing inventory command.") // TODO: localize
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