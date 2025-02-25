import {
    ActionRowBuilder,
    ButtonBuilder
} from "discord.js";

/**
 * Splits an array of buttons into multiple `ActionRowBuilder<ButtonBuilder>` instances,
 * ensuring that no row exceeds the Discord limit (max 5 buttons per row).
 *
 * @param buttons - An array of `ButtonBuilder` instances to be split into rows.
 * @param maxPerRow - The maximum number of buttons per row (default is 5).
 * @returns An array of `ActionRowBuilder<ButtonBuilder>` instances containing the buttons.
 */
function splitButtonsIntoRows(buttons: ButtonBuilder[], maxPerRow = 5): ActionRowBuilder<ButtonBuilder>[] {
    return buttons.reduce<ActionRowBuilder<ButtonBuilder>[]>((rows, button, index) => {
        if (index % maxPerRow === 0) {
            rows.push(new ActionRowBuilder<ButtonBuilder>());
        }

        rows[rows.length - 1].addComponents(button);
        return rows;
    }, []);
}

export default splitButtonsIntoRows;