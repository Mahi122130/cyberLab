// lib/i18n.ts

export type Language = "en" | "am";

export const translations = {
  en: {
    // Login
    loginTitle: "Welcome back.",
    loginSubtitle: "Sign in to continue your CyberLab journey and access your cybersecurity training environment.",
    loginAuthenticate: "AUTHENTICATE",
    loginDesc: "Enter your credentials to access CyberLab.",
    usernameOrEmail: "USERNAME OR EMAIL",
    password: "PASSWORD",
    show: "Show",
    hide: "Hide",
    authenticating: "AUTHENTICATING...",
    enterCyberlab: "ENTER CYBERLAB →",
    noAccount: "Don't have an account?",
    createAccount: "CREATE ACCOUNT →",
    secureAccessNode: "CYBERLAB // SECURE ACCESS NODE",
    secureLogin: "SECURE LOGIN",
    accessOperativeLogin: "ACCESS // OPERATIVE LOGIN",
    continueTraining: "Continue your training",
    accessSecurityLabs: "Access security labs",
    trackProgress: "Track your progress",

    // Labs Page
    cybersecurityTraining: "CYBERSECURITY TRAINING",
    securityLabs: "Security Labs",
    securityLabsDesc: "Practice real cybersecurity skills through hands-on challenges. Choose a laboratory, solve the challenges and earn XP.",
    searchLabs: "SEARCH",
    searchLabsPlaceholder: "Search labs...",
    difficultyLabel: "DIFFICULTY",
    allDifficulties: "All difficulties",
    categoryLabel: "CATEGORY",
    allCategoriesFilter: "All categories",
    refresh: "↻ REFRESH",
    loadingCaps: "LOADING...",
    apiError: "API ERROR",
    tryAgain: "TRY AGAIN",
    noLabsAvailable: "No labs available",
    noLabsFound: "No labs found",
    noLabsDesc1: "There are currently no active cybersecurity laboratories available.",
    noLabsDesc2: "Try changing your search or filters.",
    availableLabs: "AVAILABLE LABS",
    lab: "LAB",
    labsCountSuffix: "S",
    target: "TARGET",
    reward: "REWARD",
    status: "STATUS",
    active: "ACTIVE",
    startLabBtn: "START LAB →",

    // Navigation
    dashboard: "Dashboard",
    labs: "Labs",
    progress: "My Progress",
    leaderboard: "Leaderboard",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    navigation: "NAVIGATION",
    account: "ACCOUNT",

    // Search
    searchPlaceholder: "Search labs, challenges...",

    // Status
    cyberlabStatus: "CYBERLAB STATUS",
    systemsOperational: "All systems operational",
    operativeOnline: "OPERATIVE ONLINE",

    // Welcome
    welcomeBack: "Welcome back,",
    welcomeDescription:
      "Continue building your cybersecurity skills through practical labs and challenges.",

    // Stats
    currentLevel: "CURRENT LEVEL",
    totalXp: "TOTAL XP",
    labsCompleted: "LABS COMPLETED",
    globalRank: "GLOBAL RANK",

    keepLearning: "Keep learning to level up",
    experiencePoints: "Experience points earned",
    startFirstLab: "Start your first lab",
    completeLabsRank: "Complete labs to rank up",

    // Level
    levelProgress: "LEVEL PROGRESS",
    xpRemaining: "XP remaining until next level",

    // Learning
    continueLearning: "CONTINUE LEARNING",
    viewAllLabs: "VIEW ALL LABS",
    startLab: "START LAB",
    beginnerLinux: "BEGINNER // LINUX",

    linuxFundamentals: "Linux Fundamentals",
    linuxDescription:
      "Master the command line, filesystems, permissions and essential Linux commands.",

    // Recommended
    recommendedLabs: "RECOMMENDED LABS",
    exploreLabs: "EXPLORE LABS",
    allCategories: "ALL CATEGORIES",

    // Categories
    exploreByCategory: "EXPLORE BY CATEGORY",

    linux: "Linux",
    linuxCategoryDescription:
      "Operating systems & command line",

    webSecurity: "Web Security",
    webSecurityDescription:
      "Web vulnerabilities & defense",

    networking: "Networking",
    networkingDescription:
      "Networks, protocols & traffic",

    cryptography: "Cryptography",
    cryptographyDescription:
      "Encryption & security algorithms",

    labsCount: "LABS",

    // Daily mission
    dailyMission: "DAILY MISSION",
    firstChallenge: "Complete your first challenge",
    firstChallengeDescription:
      "Start your CyberLab journey and earn your first XP.",
    findChallenge: "FIND A CHALLENGE",

    // Labs
    webSecurityBasics: "Web Security Basics",
    webSecurityBasicsDescription:
      "Understand common web vulnerabilities and how they work.",

    networkReconnaissance: "Network Reconnaissance",
    networkReconnaissanceDescription:
      "Learn the fundamentals of network discovery and reconnaissance.",

    medium: "MEDIUM",
    easy: "EASY",
    hard: "HARD",

    // Language
    english: "English",
    amharic: "አማርኛ",

    // Misc
    secure: "SECURE",
    learnPracticeSecure:
      "LEARN // PRACTICE // SECURE",
    rank: "RANK",
    xp: "XP",
    level: "LEVEL",
    start: "START",
  },

  am: {
    // Login
    loginTitle: "እንኳን ደህና መጡ።",
    loginSubtitle: "የሳይበርላብ ጉዞዎን ለመቀጠል እና የሳይበር ደህንነት ስልጠና አካባቢዎን ለመድረስ ይግቡ።",
    loginAuthenticate: "ማረጋገጫ",
    loginDesc: "ሳይበርላብን ለመድረስ መረጃዎን ያስገቡ።",
    usernameOrEmail: "የተጠቃሚ ስም ወይም ኢሜይል",
    password: "የይለፍ ቃል",
    show: "አሳይ",
    hide: "ደብቅ",
    authenticating: "በማረጋገጥ ላይ...",
    enterCyberlab: "ወደ ሳይበርላብ ይግቡ →",
    noAccount: "መለያ የለዎትም?",
    createAccount: "መለያ ይፍጠሩ →",
    secureAccessNode: "ሳይበርላብ // ደህንነቱ የተጠበቀ መዳረሻ",
    secureLogin: "ደህንነቱ የተጠበቀ መግቢያ",
    accessOperativeLogin: "መዳረሻ // የተጠቃሚ መግቢያ",
    continueTraining: "ስልጠናዎን ይቀጥሉ",
    accessSecurityLabs: "የደህንነት ላቦራቶሪዎችን ያግኙ",
    trackProgress: "እድገትዎን ይከታተሉ",

    // Labs Page
    cybersecurityTraining: "የሳይበር ደህንነት ስልጠና",
    securityLabs: "የደህንነት ላቦራቶሪዎች",
    securityLabsDesc: "በተግባራዊ ተግዳሮቶች አማካኝነት እውነተኛ የሳይበር ደህንነት ክህሎቶችን ይለማመዱ። ላቦራቶሪ ይምረጡ፣ ተግዳሮቶችን ይፍቱ እና XP ያግኙ።",
    searchLabs: "ፈልግ",
    searchLabsPlaceholder: "ላቦራቶሪዎችን ፈልግ...",
    difficultyLabel: "የከበደነት ደረጃ",
    allDifficulties: "ሁሉም ደረጃዎች",
    categoryLabel: "ምድብ",
    allCategoriesFilter: "ሁሉም ምድቦች",
    refresh: "↻ አድስ",
    loadingCaps: "በመጫን ላይ...",
    apiError: "የኤፒአይ ስህተት",
    tryAgain: "እንደገና ሞክር",
    noLabsAvailable: "ምንም ላቦራቶሪዎች የሉም",
    noLabsFound: "ምንም ላቦራቶሪ አልተገኘም",
    noLabsDesc1: "በአሁኑ ጊዜ ምንም ንቁ የሳይበር ደህንነት ላቦራቶሪዎች የሉም።",
    noLabsDesc2: "ፍለጋዎን ወይም ማጣሪያዎችዎን ለመቀየር ይሞክሩ።",
    availableLabs: "የሚገኙ ላቦራቶሪዎች",
    lab: "ላቦራቶሪ",
    labsCountSuffix: "ዎች",
    target: "ዒላማ",
    reward: "ሽልማት",
    status: "ሁኔታ",
    active: "ንቁ",
    startLabBtn: "ላቦራቶሪ ጀምር →",

    // Navigation
    dashboard: "ዳሽቦርድ",
    labs: "ላብስ",
    progress: "የእኔ እድገት",
    leaderboard: "የደረጃ ሰንጠረዥ",
    profile: "መገለጫ",
    settings: "ቅንብሮች",
    logout: "ውጣ",
    navigation: "አሰሳ",
    account: "መለያ",

    // Search
    searchPlaceholder:
      "ላብስ፣ ቻሌንጆች ፈልግ...",

    // Status
    cyberlabStatus: "የሳይበርላብ ሁኔታ",
    systemsOperational:
      "ሁሉም ሲስተሞች በመደበኛነት እየሰሩ ነው",
    operativeOnline:
      "ተጠቃሚው ኦንላይን ነው",

    // Welcome
    welcomeBack: "እንኳን ደህና መጣህ፣",
    welcomeDescription:
      "በተግባራዊ ላብስ እና ቻሌንጆች የሳይበር ደህንነት እውቀትህን ማሳደግህን ቀጥል።",

    // Stats
    currentLevel: "የአሁኑ ደረጃ",
    totalXp: "ጠቅላላ XP",
    labsCompleted: "የተጠናቀቁ ላብስ",
    globalRank: "ዓለም አቀፍ ደረጃ",

    keepLearning:
      "ደረጃህን ለማሳደግ መማርህን ቀጥል",
    experiencePoints:
      "ያገኘኸው የልምድ ነጥብ",
    startFirstLab:
      "የመጀመሪያህን ላብ ጀምር",
    completeLabsRank:
      "ደረጃህን ለማሳደግ ላብስን ጨርስ",

    // Level
    levelProgress: "የደረጃ እድገት",
    xpRemaining:
      "እስከሚቀጥለው ደረጃ የሚቀረው XP",

    // Learning
    continueLearning:
      "መማርህን ቀጥል",
    viewAllLabs:
      "ሁሉንም ላብስ ይመልከቱ",
    startLab: "ላብ ጀምር",
    beginnerLinux:
      "ጀማሪ // LINUX",

    linuxFundamentals:
      "የLinux መሠረታዊ እውቀት",
    linuxDescription:
      "Command line፣ filesystem፣ permissions እና አስፈላጊ የLinux ትዕዛዞችን ተማር።",

    // Recommended
    recommendedLabs:
      "የሚመከሩ ላብስ",
    exploreLabs:
      "ላብስን ይመልከቱ",
    allCategories:
      "ሁሉንም ምድቦች",

    // Categories
    exploreByCategory:
      "በምድብ ይፈልጉ",

    linux: "Linux",
    linuxCategoryDescription:
      "Operating systems እና command line",

    webSecurity:
      "የድር ደህንነት",
    webSecurityDescription:
      "የድር ደህንነት ችግሮች እና መከላከያ",

    networking:
      "ኔትወርኪንግ",
    networkingDescription:
      "ኔትወርኮች፣ ፕሮቶኮሎች እና ትራፊክ",

    cryptography:
      "ክሪፕቶግራፊ",
    cryptographyDescription:
      "ምስጠራ እና የደህንነት አልጎሪዝሞች",

    labsCount: "ላብስ",

    // Daily mission
    dailyMission:
      "የዕለቱ ተልዕኮ",
    firstChallenge:
      "የመጀመሪያህን ቻሌንጅ ጨርስ",
    firstChallengeDescription:
      "የCyberLab ጉዞህን ጀምር እና የመጀመሪያህን XP አግኝ።",
    findChallenge:
      "ቻሌንጅ ፈልግ",

    // Labs
    webSecurityBasics:
      "የድር ደህንነት መሠረቶች",
    webSecurityBasicsDescription:
      "የተለመዱ የድር ደህንነት ችግሮችን እና አሰራራቸውን ተረዳ።",

    networkReconnaissance:
      "የኔትወርክ ምርመራ",
    networkReconnaissanceDescription:
      "የኔትወርክ ግኝት እና reconnaissance መሠረታዊ እውቀትን ተማር።",

    medium: "መካከለኛ",
    easy: "ቀላል",
    hard: "ከባድ",

    // Language
    english: "English",
    amharic: "አማርኛ",

    // Misc
    secure:
      "ደህንነቱ የተጠበቀ",
    learnPracticeSecure:
      "ተማር // ተለማመድ // ጠብቅ",
    rank: "ደረጃ",
    xp: "XP",
    level: "ደረጃ",
    start: "ጀምር",
  },
} as const;

export type TranslationKey =
  keyof typeof translations.en;

export function getTranslations(
  language: Language,
) {
  return translations[language];
}