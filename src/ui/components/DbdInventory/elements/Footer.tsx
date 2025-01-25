import React from "react";
import {
    combineBaseUrlWithPath,
    formatNumber
} from "@utils/stringUtils";
import { ConsumedCellsItem } from "@commands/inventory/schemas/consumedCellsSchema";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { Locale } from "discord.js";

type FooterProps = {
    consumedCells: ConsumedCellsItem[];
    isGDPR: boolean;
    locale: Locale;
}

function Footer({ consumedCells, isGDPR, locale }: FooterProps) {
    let totalCellsConsumed = 0;
    for (const consumedCell of consumedCells) {
        const amount = consumedCell.data.amount;
        if (amount > 0) {
            totalCellsConsumed += amount;
        }
    }
    return (
        <div className="inventory-footer">
            <div className="price-disclaimer">
                <div style={{ position: "relative" }}>
                    <img className="tooltip-info-icon"
                         src={combineBaseUrlWithPath("/images/Other/tooltip_infoIcon.png")} alt="Info"/>
                    {/* TODO: localize */}
                    {t('dbd_inventory.footer.price_disclaimer', locale, ELocaleNamespace.UI)}
                </div>
            </div>
            {isGDPR ? <div className="total-cells-consumed">
                <span className="total-cells-consumed-value">
                    <img style={{ width: "24px" }} src={combineBaseUrlWithPath("/images/Currency/AuricCells_Icon.png")}
                         alt="Cells"/>
                    {formatNumber(totalCellsConsumed)}
                </span>
                {/* TODO: localize */}
                <div className="total-cells-consumed-text">
                    {t('dbd_inventory.footer.consumed_cells', locale, ELocaleNamespace.UI)}
                </div>
            </div> : null}
        </div>
    );
}

export default Footer;