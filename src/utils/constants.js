/**
 * Constants and static data
 */

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'nl', 'ro', 'sv'];
export const DEFAULT_LANGUAGE = 'en';

export const difficultyHintKeys = {
    easy: 'difficulty.easyHint',
    medium: 'difficulty.mediumHint',
    hard: 'difficulty.hardHint'
};

export const ACHIEVEMENTS = {
    firstQuiz: {
        id: 'firstQuiz',
        nameKey: 'achievements.firstSteps',
        descKey: 'achievements.firstStepsDesc',
        icon: '🎯',
        check: (stats) => stats.totalQuizzes >= 1
    },
    perfectScore: {
        id: 'perfectScore',
        nameKey: 'achievements.perfect',
        descKey: 'achievements.perfectDesc',
        icon: '⭐',
        check: (stats) => stats.perfectScores >= 1
    },
    fivePerfect: {
        id: 'fivePerfect',
        nameKey: 'achievements.perfectionist',
        descKey: 'achievements.perfectionistDesc',
        icon: '🌟',
        check: (stats) => stats.perfectScores >= 5
    },
    streak5: {
        id: 'streak5',
        nameKey: 'achievements.onFire',
        descKey: 'achievements.onFireDesc',
        icon: '🔥',
        check: (stats) => stats.maxStreak >= 5
    },
    streak10: {
        id: 'streak10',
        nameKey: 'achievements.unstoppable',
        descKey: 'achievements.unstoppableDesc',
        icon: '💥',
        check: (stats) => stats.maxStreak >= 10
    },
    tenQuizzes: {
        id: 'tenQuizzes',
        nameKey: 'achievements.dedicated',
        descKey: 'achievements.dedicatedDesc',
        icon: '📚',
        check: (stats) => stats.totalQuizzes >= 10
    },
    fiftyQuizzes: {
        id: 'fiftyQuizzes',
        nameKey: 'achievements.quizMaster',
        descKey: 'achievements.quizMasterDesc',
        icon: '🎓',
        check: (stats) => stats.totalQuizzes >= 50
    },
    masterFive: {
        id: 'masterFive',
        nameKey: 'achievements.gettingThere',
        descKey: 'achievements.gettingThereDesc',
        icon: '🗺️',
        check: (stats) => stats.masteredCountries >= 5
    },
    masterTwenty: {
        id: 'masterTwenty',
        nameKey: 'achievements.geographyBuff',
        descKey: 'achievements.geographyBuffDesc',
        icon: '🌍',
        check: (stats) => stats.masteredCountries >= 20
    },
    masterAll: {
        id: 'masterAll',
        nameKey: 'achievements.europeanExpert',
        descKey: 'achievements.europeanExpertDesc',
        icon: '👑',
        check: (stats) => stats.masteredCountries >= 45
    },
    hardMode: {
        id: 'hardMode',
        nameKey: 'achievements.challengeAccepted',
        descKey: 'achievements.challengeAcceptedDesc',
        icon: '💪',
        check: (stats) => stats.hardQuizzes >= 1
    },
    hardPerfect: {
        id: 'hardPerfect',
        nameKey: 'achievements.legendary',
        descKey: 'achievements.legendaryDesc',
        icon: '🏆',
        check: (stats) => stats.hardPerfectScores >= 1
    },
    speedDemon: {
        id: 'speedDemon',
        nameKey: 'achievements.speedDemon',
        descKey: 'achievements.speedDemonDesc',
        icon: '⚡',
        check: (stats) => stats.speedRuns >= 1
    },
    noHints: {
        id: 'noHints',
        nameKey: 'achievements.noHelpNeeded',
        descKey: 'achievements.noHelpNeededDesc',
        icon: '🧠',
        check: (stats) => stats.perfectNoHints >= 1
    },
    balkanExpert: {
        id: 'balkanExpert',
        nameKey: 'achievements.balkanExpert',
        descKey: 'achievements.balkanExpertDesc',
        icon: '🏔️',
        check: (stats) => stats.balkansMastered >= 8
    },
    nordicExpert: {
        id: 'nordicExpert',
        nameKey: 'achievements.nordicExplorer',
        descKey: 'achievements.nordicExplorerDesc',
        icon: '❄️',
        check: (stats) => stats.nordicMastered >= 5
    },
    // Regional achievements
    westernExpert: {
        id: 'westernExpert',
        nameKey: 'achievements.westernExpert',
        descKey: 'achievements.westernExpertDesc',
        icon: '🏰',
        check: (stats) => stats.westernMastered >= 10
    },
    easternExpert: {
        id: 'easternExpert',
        nameKey: 'achievements.easternExpert',
        descKey: 'achievements.easternExpertDesc',
        icon: '🌻',
        check: (stats) => stats.easternMastered >= 8
    },
    balticExpert: {
        id: 'balticExpert',
        nameKey: 'achievements.balticExpert',
        descKey: 'achievements.balticExpertDesc',
        icon: '🌊',
        check: (stats) => stats.balticMastered >= 3
    },
    mediterraneanExpert: {
        id: 'mediterraneanExpert',
        nameKey: 'achievements.mediterraneanExpert',
        descKey: 'achievements.mediterraneanExpertDesc',
        icon: '☀️',
        check: (stats) => stats.mediterraneanMastered >= 8
    },
    microstateExpert: {
        id: 'microstateExpert',
        nameKey: 'achievements.microstateExpert',
        descKey: 'achievements.microstateExpertDesc',
        icon: '💎',
        check: (stats) => stats.microstatesMastered >= 6
    },
    // Higher streaks
    streak15: {
        id: 'streak15',
        nameKey: 'achievements.onARoll',
        descKey: 'achievements.onARollDesc',
        icon: '🎯',
        check: (stats) => stats.maxStreak >= 15
    },
    streak20: {
        id: 'streak20',
        nameKey: 'achievements.flawless',
        descKey: 'achievements.flawlessDesc',
        icon: '💫',
        check: (stats) => stats.maxStreak >= 20
    },
    // More milestones
    hundredQuizzes: {
        id: 'hundredQuizzes',
        nameKey: 'achievements.centurion',
        descKey: 'achievements.centurionDesc',
        icon: '🎖️',
        check: (stats) => stats.totalQuizzes >= 100
    },
    tenPerfect: {
        id: 'tenPerfect',
        nameKey: 'achievements.goldStandard',
        descKey: 'achievements.goldStandardDesc',
        icon: '🥇',
        check: (stats) => stats.perfectScores >= 10
    },
    // Speed run progression
    speedRunPro: {
        id: 'speedRunPro',
        nameKey: 'achievements.speedRunPro',
        descKey: 'achievements.speedRunProDesc',
        icon: '🏃',
        check: (stats) => stats.speedRuns >= 5
    },
    speedRunMaster: {
        id: 'speedRunMaster',
        nameKey: 'achievements.speedRunMaster',
        descKey: 'achievements.speedRunMasterDesc',
        icon: '🚀',
        check: (stats) => stats.speedRuns >= 10
    },
    // No hints mastery
    fiveNoHints: {
        id: 'fiveNoHints',
        nameKey: 'achievements.pureBrainpower',
        descKey: 'achievements.pureBrainpowerDesc',
        icon: '🎓',
        check: (stats) => stats.perfectNoHints >= 5
    }
};

export const STORAGE_KEYS = {
    progress: 'euroquiz_progress',
    leaderboard: 'euroquiz_leaderboard',
    achievements: 'euroquiz_achievements',
    stats: 'euroquiz_stats'
};

export const CAPITAL_COORDINATES = {
    'France': { lat: 48.8566, lng: 2.3522, capital: 'Paris' },
    'Germany': { lat: 52.5200, lng: 13.4050, capital: 'Berlin' },
    'Spain': { lat: 40.4168, lng: -3.7038, capital: 'Madrid' },
    'Italy': { lat: 41.9028, lng: 12.4964, capital: 'Rome' },
    'Portugal': { lat: 38.7223, lng: -9.1393, capital: 'Lisbon' },
    'Poland': { lat: 52.2297, lng: 21.0122, capital: 'Warsaw' },
    'Netherlands': { lat: 52.3676, lng: 4.9041, capital: 'Amsterdam' },
    'Belgium': { lat: 50.8503, lng: 4.3517, capital: 'Brussels' },
    'Austria': { lat: 48.2082, lng: 16.3738, capital: 'Vienna' },
    'Switzerland': { lat: 46.9480, lng: 7.4474, capital: 'Bern' },
    'Sweden': { lat: 59.3293, lng: 18.0686, capital: 'Stockholm' },
    'Norway': { lat: 59.9139, lng: 10.7522, capital: 'Oslo' },
    'Denmark': { lat: 55.6761, lng: 12.5683, capital: 'Copenhagen' },
    'Finland': { lat: 60.1699, lng: 24.9384, capital: 'Helsinki' },
    'Greece': { lat: 37.9838, lng: 23.7275, capital: 'Athens' },
    'Czech Republic': { lat: 50.0755, lng: 14.4378, capital: 'Prague' },
    'Hungary': { lat: 47.4979, lng: 19.0402, capital: 'Budapest' },
    'Romania': { lat: 44.4268, lng: 26.1025, capital: 'Bucharest' },
    'Bulgaria': { lat: 42.6977, lng: 23.3219, capital: 'Sofia' },
    'Croatia': { lat: 45.8150, lng: 15.9819, capital: 'Zagreb' },
    'Slovenia': { lat: 46.0569, lng: 14.5058, capital: 'Ljubljana' },
    'Slovakia': { lat: 48.1486, lng: 17.1077, capital: 'Bratislava' },
    'Ireland': { lat: 53.3498, lng: -6.2603, capital: 'Dublin' },
    'Serbia': { lat: 44.7866, lng: 20.4489, capital: 'Belgrade' },
    'Ukraine': { lat: 50.4501, lng: 30.5234, capital: 'Kyiv' },
    'Estonia': { lat: 59.4370, lng: 24.7536, capital: 'Tallinn' },
    'Latvia': { lat: 56.9496, lng: 24.1052, capital: 'Riga' },
    'Lithuania': { lat: 54.6872, lng: 25.2797, capital: 'Vilnius' },
    'Albania': { lat: 41.3275, lng: 19.8187, capital: 'Tirana' },
    'North Macedonia': { lat: 41.9973, lng: 21.4280, capital: 'Skopje' },
    'Montenegro': { lat: 42.4304, lng: 19.2594, capital: 'Podgorica' },
    'Bosnia and Herzegovina': { lat: 43.8563, lng: 18.4131, capital: 'Sarajevo' },
    'Moldova': { lat: 47.0105, lng: 28.8638, capital: 'Chișinău' },
    'Belarus': { lat: 53.9006, lng: 27.5590, capital: 'Minsk' },
    'Iceland': { lat: 64.1466, lng: -21.9426, capital: 'Reykjavík' },
    'Luxembourg': { lat: 49.6116, lng: 6.1319, capital: 'Luxembourg City' },
    'Malta': { lat: 35.8989, lng: 14.5146, capital: 'Valletta' },
    'Cyprus': { lat: 35.1856, lng: 33.3823, capital: 'Nicosia' },
    'Monaco': { lat: 43.7384, lng: 7.4246, capital: 'Monaco' },
    'Andorra': { lat: 42.5063, lng: 1.5218, capital: 'Andorra la Vella' },
    'United Kingdom': { lat: 51.5074, lng: -0.1278, capital: 'London' },
    'Russia': { lat: 55.7558, lng: 37.6173, capital: 'Moscow' },
    'Liechtenstein': { lat: 47.1410, lng: 9.5209, capital: 'Vaduz' },
    'San Marino': { lat: 43.9424, lng: 12.4578, capital: 'San Marino' },
    'Kosovo': { lat: 42.6629, lng: 21.1655, capital: 'Pristina' }
};

export const COUNTRY_CODES = {
    'France': 'fr', 'Germany': 'de', 'Spain': 'es', 'Italy': 'it', 'Portugal': 'pt',
    'Poland': 'pl', 'Netherlands': 'nl', 'Belgium': 'be', 'Austria': 'at', 'Switzerland': 'ch',
    'Sweden': 'se', 'Norway': 'no', 'Denmark': 'dk', 'Finland': 'fi', 'Greece': 'gr',
    'Czech Republic': 'cz', 'Hungary': 'hu', 'Romania': 'ro', 'Bulgaria': 'bg', 'Croatia': 'hr',
    'Slovenia': 'si', 'Slovakia': 'sk', 'Ireland': 'ie', 'Serbia': 'rs', 'Ukraine': 'ua',
    'Estonia': 'ee', 'Latvia': 'lv', 'Lithuania': 'lt', 'Albania': 'al', 'North Macedonia': 'mk',
    'Montenegro': 'me', 'Bosnia and Herzegovina': 'ba', 'Moldova': 'md', 'Belarus': 'by',
    'Iceland': 'is', 'Luxembourg': 'lu', 'Malta': 'mt', 'Cyprus': 'cy', 'Monaco': 'mc',
    'Andorra': 'ad', 'United Kingdom': 'gb', 'Russia': 'ru', 'Liechtenstein': 'li',
    'San Marino': 'sm', 'Kosovo': 'xk'
};
