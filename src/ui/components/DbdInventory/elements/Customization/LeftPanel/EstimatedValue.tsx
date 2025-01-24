import React from "react";
import { IParsedInventory } from "../../../data/inventory";
import {
    combineBaseUrlWithPath,
    formatNumber
} from "@utils/stringUtils";

function EstimatedValue({ parsedInventory }: { parsedInventory: IParsedInventory }) {
    const cellsValue = formatNumber(parsedInventory.estimatedValue["Cells"]);
    const shardsValue = formatNumber(parsedInventory.estimatedValue["Shards"]);

    return (
        <div style={{ position: "relative" }}>
            <img src={combineBaseUrlWithPath('/images/Other/CurrenciesMerged.png')} style={{ marginLeft: "40px" }}
                 alt="Estimated value" height="64px"/>
            <div className="estimated-value-cells">{parsedInventory.estimatedValue["Cells"] ? cellsValue : '---'}</div>
            <div
                className="estimated-value-shards">{parsedInventory.estimatedValue["Shards"] ? shardsValue : '---'}</div>
        </div>
    );
}

export default EstimatedValue;