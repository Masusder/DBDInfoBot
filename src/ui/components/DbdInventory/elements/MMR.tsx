import React from "react";
import {
    convertToPercentage,
    percentageToColor
} from "../utils";
import { Character } from "@tps/character";
import { DbdRatingsItem } from "@commands/inventory/schemas/ratingsSchema";

/**
 * Quick overview of the MMR:
 *
 * mu (μ)       -> your current rating (default: 3.29479415488021)
 * phi (φ)      -> deviation, measures confidence in your rating. It should go down the more you play (default: 2)
 *                  (I personally use phi for showcasing "stability" of the ranking metric)
 * sigma (σ)    -> volatility, represents fluctuation in your performance. Impacts how quickly your skill will change (default: 0.06)
 * peakMMR      -> highest your rating has been so far
 * status       -> "Rated" or "Unrated"
 *
 * I think it's based on Glicko algorithm, which is odd choice considering asymmetrical aspect of the game:
 * https://en.wikipedia.org/wiki/Glicko_rating_system
 */

type MMRProps = {
    ratings: DbdRatingsItem[];
    character: Character;
}

function MMR({ ratings, character }: MMRProps) {
    const characterRating = ratings.find((r) => {
        if (character.Role === "Survivor") {
            return r.objectId === "VE_Camper";
        } else {
            const objectIdParts = r.objectId.split(':');
            const slasherId = objectIdParts[1];
            return slasherId && slasherId.toLowerCase() === character.Id.toLowerCase();
        }
    });

    if (!characterRating) return null;

    // I'm using phi instead of sigma
    // as I feel like it describes stability more accurately
    // I could be wrong about this approach
    const stabilityPercentage = convertToPercentage(characterRating.data.rating.phi, 2) // From data set I had, it seems like 2 is the max value

    const mu = characterRating.data.rating.mu;
    const peakMMR = characterRating.data.peakMMR || mu;

    const higherRankCount = ratings.filter((r) => {
        const objectIdParts = r.objectId.split(':');
        const slasherId = objectIdParts[1];
        return slasherId && r.objectId.startsWith("VE_Slasher") && r.data.rating.mu > mu;
    }).length;

    const totalRankings = ratings.filter((r) => {
        const objectIdParts = r.objectId.split(':');
        const slasherId = objectIdParts[1];
        return slasherId && r.objectId.startsWith("VE_Slasher");
    }).length;

    const rank = `${higherRankCount + 1} / ${totalRankings}`;

    return (
        <div className="mmr-container">
            <div style={{ position: "relative" }}>
                {/* TODO: localize */}
                <div className="stability-text-stable">Stable</div>
                <div className="mmr-title">Matchmaking Rating (MMR)</div>
                <div className="stability-text-unstable">Unstable</div>
                <div className="stability-percentage">{stabilityPercentage.toFixed(2)}%</div>
                <div
                    className="stability-progressbar-progress"
                    style={{ background: percentageToColor(stabilityPercentage), width: stabilityPercentage + '%' }}
                ></div>
                <div className="stability-progressbar"></div>
            </div>
            <SplitProgressbar peakMMR={peakMMR} mu={mu}/>
            <div style={{ display: "flex", flexDirection: "row", marginTop: '10px', gap: "5px" }}>
                {character.Role === "Killer" ?
                    <div className="mmr-info-box"
                         style={{
                             background: 'radial-gradient(circle, #712c17, #151515)',
                             borderColor: "#FF5722"
                         }}>
                        <span className="mmr-info-box-text">Compared Rank</span>
                        <span style={{ textTransform: 'uppercase' }}
                              className="mmr-info-box-value">{rank}</span>
                    </div> : null}
                <div className="mmr-info-box" style={{ background: 'radial-gradient(circle, #18384B, #151515)' }}>
                    <span className="mmr-info-box-text">Current MMR</span>
                    <span
                        className={`mmr-info-box-value ${mu < 0 ? 'mmr-info-box-value-negative' : 'mmr-info-box-value-positive'}`}>{mu.toFixed(1)}</span>
                </div>
                <div className="mmr-info-box"
                     style={{ background: 'radial-gradient(circle, #2C4D32, #151515)', borderColor: "#2DDD62" }}>
                    <span className="mmr-info-box-text">Peak MMR</span>
                    <span
                        className={`mmr-info-box-value ${peakMMR < 0 ? 'mmr-info-box-value-negative' : 'mmr-info-box-value-peak'}`}>{peakMMR.toFixed(1)}</span>
                </div>
                <div className="mmr-info-box"
                     style={{ background: 'radial-gradient(circle, #474747, #151515)', borderColor: "#9B9B9B" }}>
                    <span className="mmr-info-box-text">Status</span>
                    <span style={{ textTransform: 'uppercase' }}
                          className="mmr-info-box-value">{characterRating.data.ratingStatus === "Unrated" ? "Unranked" : "Ranked"}</span>
                </div>
            </div>
            <div className="mmr-last-update">
                {/* TODO: localize */}
                <div className="mmr-last-update-title">Last Update</div>
                <span
                    className="mmr-last-update-date">{new Date(characterRating.data.lastUpdate).toLocaleString()}</span>
            </div>
        </div>
    );
}

function SplitProgressbar({ peakMMR, mu }: { peakMMR: number, mu: number }) {
    const sections = peakMMR > 0 ? Math.ceil(peakMMR) : 0;
    const negativeSections = mu < 0 ? Math.ceil(Math.abs(mu)) : 0;

    console.log(sections);

    const filledSectionsForMu = Math.floor(mu);
    const filledNegativeSectionsForMu = Math.floor(Math.abs(mu));

    const filledSectionsForPeakMMR = Math.floor(peakMMR);

    const fractionalMuPart = mu - filledSectionsForMu;
    const fractionalNegativeMuPart = Math.abs(mu) - filledNegativeSectionsForMu;
    const fractionalPeakMMRPart = peakMMR - filledSectionsForPeakMMR;

    const getSectionStyles = (
        index: number,
        filledSectionsForMu: number,
        filledSectionsForPeakMMR: number,
        fractionalMuPart: number,
        fractionalPeakMMRPart: number,
        isNegative: boolean
    ) => {
        const isMuFilled = index < filledSectionsForMu;
        const isPeakMMRFilled = index >= filledSectionsForMu && index < filledSectionsForPeakMMR;
        const isAfterPeakMMR = index >= filledSectionsForPeakMMR;
        const isPartialMu = index === filledSectionsForMu && fractionalMuPart > 0;
        const isPartialPeakMMR = index === filledSectionsForPeakMMR && fractionalPeakMMRPart > 0;

        let background = '';

        if (isPeakMMRFilled) background = '#2DDD62';
        if (isMuFilled) background = isNegative ? 'red' : 'dodgerblue';
        if (isAfterPeakMMR && !isNegative) background = '#f0f0f0';
        if (isPartialMu) background = isNegative ?
            `linear-gradient(to left, red ${fractionalMuPart * 100}%, #f0f0f0 ${fractionalMuPart * 100}%)`
            : `linear-gradient(to right, dodgerblue ${fractionalMuPart * 100}%, #2DDD62 ${fractionalMuPart * 100}%)`;
        if (isPartialPeakMMR && !isNegative) background = `linear-gradient(to right, #2DDD62 ${fractionalPeakMMRPart * 100}%, #f0f0f0 ${fractionalPeakMMRPart * 100}%)`;
        if (isPartialMu && isPartialPeakMMR && !isNegative) {
            background = `linear-gradient(to right, dodgerblue ${fractionalMuPart * 100}%, #2DDD62 ${fractionalMuPart * 100}%, #2DDD62 ${fractionalPeakMMRPart * 100}%, #f0f0f0 ${fractionalPeakMMRPart * 100}%)`;
        }

        return background;
    };

    return (
        <div className="mmr-split-progressbar-container">
            {negativeSections > 0 ? <div className="mmr-split-progressbar-extension-left"/> : null}
            {[...Array(negativeSections)].map((_, index) => {
                const sectionStyles = getSectionStyles(index, filledNegativeSectionsForMu, filledSectionsForPeakMMR, fractionalNegativeMuPart, fractionalPeakMMRPart, true);

                return (
                    <div
                        key={index}
                        className="split-progressbar-section"
                        style={{
                            width: '100%',
                            background: sectionStyles,
                        }}
                    ></div>
                );
            }).reverse()}
            {[...Array(sections)].map((_, index) => {
                const sectionStyles = getSectionStyles(index, filledSectionsForMu, filledSectionsForPeakMMR, fractionalMuPart, fractionalPeakMMRPart, false);

                return (
                    <div
                        key={index}
                        className="split-progressbar-section"
                        style={{
                            width: '100%',
                            background: sectionStyles,
                        }}
                    ></div>
                );
            })}
            {sections > 0 ? <div className="mmr-split-progressbar-extension-right"/> : null}
        </div>
    )
}

export default MMR;