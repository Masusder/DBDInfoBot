import React from "react";
import {
    combineBaseUrlWithPath,
    formatNumber
} from "@utils/stringUtils";
import { ConsumedCellsItem } from "@commands/inventory/schemas/consumedCellsSchema";

type FooterProps = {
    consumedCells: ConsumedCellsItem[];
    isGDPR: boolean;
}

function Footer({ consumedCells, isGDPR }: FooterProps) {
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
                    Price reflects current cosmetics value, not the original purchase amount. Discounts also don’t
                    apply.
                </div>
            </div>
            {isGDPR ? <div className="total-cells-consumed">
                <span className="total-cells-consumed-value">
                    <img style={{ width: "24px" }} src={combineBaseUrlWithPath("/images/Currency/AuricCells_Icon.png")}
                         alt="Cells"/>
                    {formatNumber(totalCellsConsumed)}
                </span>
                {/* TODO: localize */}
                <div className="total-cells-consumed-text">Total Auric Cells consumed</div>
            </div> : null}
        </div>
    );
}

export default Footer;