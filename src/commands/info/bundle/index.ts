import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Locale,
    NewsChannel
} from "discord.js";
import {
    getBundleChoices,
    getBundleDataById,
} from "@services/bundleService";
import { Bundle } from "@tps/bundle";
import { getCachedCosmetics } from "@services/cosmeticService";
import { isValidData } from "@utils/stringUtils";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import publishMessage from "@utils/discord/publishMessage";
import generateBundleInteractionData from "@commands/info/bundle/interactionData";
import logger from "@logger";

// region Interaction Handlers
export async function handleBundleCommandInteraction(interaction: ChatInputCommandInteraction) {
    const bundleId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!bundleId) return;

    try {
        await interaction.deferReply();

        const [bundle, cosmeticData] = await Promise.all([
            getBundleDataById(bundleId, locale),
            getCachedCosmetics(locale)
        ]);

        if (!bundle || !isValidData(cosmeticData)) {
            const message = t('general.failed_load_game_data', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        const {
            embed,
            attachments,
            buttons
        } = await generateBundleInteractionData(bundle, cosmeticData, locale);

        await interaction.editReply({
            embeds: [embed],
            files: attachments,
            components: buttons
        });
    } catch (error) {
        logger.error("Error executing bundle subcommand:", error);
    }
}

export async function handleBatchSendBundlesToChannel(
    bundleData: Record<string, Bundle>,
    bundleIdsToDispatch: string[],
    channel: NewsChannel
) {
    try {
        const cosmeticData = await getCachedCosmetics(Locale.EnglishUS);

        for (const bundleId of bundleIdsToDispatch) {
            try {
                const bundle = bundleData[bundleId];

                const {
                    embed,
                    attachments,
                    buttons
                } = await generateBundleInteractionData(bundle, cosmeticData, Locale.EnglishUS);

                const message = await channel.send({
                    embeds: [embed],
                    files: attachments,
                    components: buttons
                });

                publishMessage(message, channel).catch(error => {
                    logger.error(`Failed to publish message for bundle ${bundleId}:`, error);
                });
            } catch (error) {
                logger.error(`Failed to send bundle ${bundleId}:`, error);
            }
        }
    } catch (error) {
        logger.error("Failed batch sending bundles:", error);
    }
}

// endregion

// region Autocomplete
export async function handleBundleCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getBundleChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(bundle => ({
            name: `${bundle.SpecialPackTitle} (ID: ${bundle.Id})`, // Bundle names can repeat
            value: bundle.Id
        }));

        await interaction.respond(options);
    } catch (error) {
        logger.error("Error handling autocomplete bundle interaction:", error);
    }
}

// endregion