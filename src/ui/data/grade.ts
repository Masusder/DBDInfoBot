import { combineBaseUrlWithPath } from "@utils/stringUtils.ts";

type GradeInfo = {
    color: string;
    grades: {
        ash: { image: string; name: string };
        bronze: { image: string; name: string };
        silver: { image: string; name: string };
        gold: { image: string; name: string };
        iridescent: { image: string; name: string };
        iridescent1: { image: string; name: string };
    };
};

export type GradeDetails = {
    pipsImage: string;
    gradeImage: string;
    level: string;
    gradeName: string;
    color: string;
};

const gradeMappings: Record<string, GradeInfo> = {
    Survivor: {
        color: "#958e70",
        grades: {
            ash: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_survivorAsh.png'),
                name: "Ash"
            },
            bronze: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_survivorBronze.png'),
                name: "Bronze"
            },
            silver: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_survivorSilver.png'),
                name: "Silver"
            },
            gold: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_survivorGold.png'),
                name: "Gold"
            },
            iridescent: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_survivorIridescent.png'),
                name: "Iridescent"
            },
            iridescent1: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_survivorIridescent_I.png'),
                name: "Iridescent"
            }
        }
    },
    Killer: {
        color: "#958e70",
        grades: {
            ash: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_killerAsh.png'),
                name: "Ash"
            },
            bronze: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_killerBronze.png'),
                name: "Bronze"
            },
            silver: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_killerSilver.png'),
                name: "Silver"
            },
            gold: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_killerGold.png'),
                name: "Gold"
            },
            iridescent: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_killerIridescent.png'),
                name: "Iridescent"
            },
            iridescent1: {
                image: combineBaseUrlWithPath('/images/Grades/IconGrade_killerIridescent_I.png'),
                name: "Iridescent"
            }
        }
    }
};

const pipsToDetails = [
    // Ash Grade
    { level: "IV", range: [0, 2], grade: "ash", color: "#958e70", pips: 3 },
    { level: "III", range: [3, 5], grade: "ash", color: "#958e70", pips: 3 },
    { level: "II", range: [6, 9], grade: "ash", color: "#958e70", pips: 4 },
    { level: "I", range: [10, 13], grade: "ash", color: "#958e70", pips: 4 },

    // Bronze Grade
    { level: "IV", range: [14, 17], grade: "bronze", color: "#c2593a", pips: 4 },
    { level: "III", range: [18, 21], grade: "bronze", color: "#c2593a", pips: 4 },
    { level: "II", range: [22, 25], grade: "bronze", color: "#c2593a", pips: 4 },
    { level: "I", range: [26, 29], grade: "bronze", color: "#c2593a", pips: 4 },

    // Silver Grade
    { level: "IV", range: [30, 34], grade: "silver", color: "#b5afb0", pips: 5 },
    { level: "III", range: [35, 39], grade: "silver", color: "#b5afb0", pips: 5 },
    { level: "II", range: [40, 44], grade: "silver", color: "#b5afb0", pips: 5 },
    { level: "I", range: [45, 49], grade: "silver", color: "#b5afb0", pips: 5 },

    // Gold Grade
    { level: "IV", range: [50, 54], grade: "gold", color: "#d4af37", pips: 5 },
    { level: "III", range: [55, 59], grade: "gold", color: "#d4af37", pips: 5 },
    { level: "II", range: [60, 64], grade: "gold", color: "#d4af37", pips: 5 },
    { level: "I", range: [65, 69], grade: "gold", color: "#d4af37", pips: 5 },

    // Iridescent Grade
    { level: "IV", range: [70, 74], grade: "iridescent", color: "#ff0000", pips: 5 },
    { level: "III", range: [75, 79], grade: "iridescent", color: "#ff0000", pips: 5 },
    { level: "II", range: [80, 84], grade: "iridescent", color: "#ff0000", pips: 5 },

    // Iridescent 1 (Highest Grade)
    { level: "I", range: [85, Infinity], grade: "iridescent1", color: "#ff0000", pips: 0 }
];

function getGradeInfo(role: string): GradeInfo {
    return gradeMappings[role] ?? gradeMappings["Survivor"];
}

function getDetailsFromPips(
    pips: number,
    gradeInfo: GradeInfo
): GradeDetails {
    const details = pipsToDetails.find(({ range }) => pips >= range[0] && pips <= range[1]);

    if (!details) {
        throw Error("Pips value must be between 0 to 85");
    }

    const gradeKey = details?.grade || "ash";
    const { image: gradeImage, name: gradeName } = gradeInfo.grades[gradeKey as keyof typeof gradeInfo.grades];

    const pipMod = pips % details.pips;

    const pipsImage = pips === 85 ? '' : combineBaseUrlWithPath(`/images/Grades/Pips/IconHUD_Pips_${details.pips}-${pipMod}.png`);

    return {
        gradeImage,
        level: details?.level || "I",
        gradeName,
        color: details?.color || gradeInfo.color,
        pipsImage
    };
}

export function formatGrades(pips: number, role: string): GradeDetails {
    const gradeInfo = getGradeInfo(role);

    const { gradeImage, level, gradeName, color, pipsImage } = getDetailsFromPips(pips, gradeInfo);

    return {
        pipsImage,
        gradeImage,
        level,
        gradeName,
        color
    };
}
