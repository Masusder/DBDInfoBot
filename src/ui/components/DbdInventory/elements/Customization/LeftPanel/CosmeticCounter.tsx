import { IParsedInventory } from "../../../data/inventory";
import * as React from "react";
import { CosmeticTypes } from "@data/CosmeticTypes";
import { FadingDivider } from "@ui/components/General/Dividers";

interface CosmeticCounterProps {
    parsedInventory: IParsedInventory;
}

function CosmeticCounter({ parsedInventory }: CosmeticCounterProps) {
    const stats = parsedInventory.categoryStats['outfit'];

    return (
        <div>
            <div className="outfits-count-flex">
                <img className="outfit-icon" src={CosmeticTypes["outfit"].icon} alt="Outfit Icon"/>
                <div className="outfit-count">{stats.owned ?? 0} / {stats.max ?? 0}</div>
            </div>
            <PiecesCounter parsedInventory={parsedInventory}/>
        </div>
    );
}

function PiecesCounter({ parsedInventory }: CosmeticCounterProps) {
    const { categoryStats } = parsedInventory;

    const categories = Object.entries(categoryStats).filter(([category]) => category !== "outfit");

    return (
        <div className="cosmetic-counter-container">
            {categories.map(([category, stat], index) => {
                if (category === "outfit") return null; // Skip outfit category

                const isLastElement = index === categories.length - 1;

                return (
                    <React.Fragment key={category}>
                        <div className="pieces-container">
                            <img src={CosmeticTypes[category].icon} height="40px" alt={category}/>
                            <div className="pieces-count">{stat.owned} / {stat.max}</div>
                        </div>
                        {!isLastElement && <FadingDivider direction="vertical" width="1px" height="50px"/>}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// interface FadingDividerProps {
//     direction?: 'horizontal' | 'vertical';
//     height?: string;
//     width?: string;
//     margin?: string;
// }
//
// // TODO: delete later
// export const FadingDivider: React.FC<FadingDividerProps> = (
//     {
//         direction = 'horizontal',
//         height = '10px',
//         width = '100%',
//         margin = ''
//     }) => {
//     return (
//         <div
//             className={`dividers-fading-divider dividers-fading-divider-${direction}`}
//             style={{ height, width, margin }}
//         />
//     );
// };

export default CosmeticCounter;