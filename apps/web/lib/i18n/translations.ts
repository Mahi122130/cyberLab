export type Language = "en" | "am";

export const translations = {
  en: {
    navigation: {
      dashboard: "Dashboard",
      labs: "Labs",
      challenges: "Challenges",
      leaderboard: "Leaderboard",
      achievements: "Achievements",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
    },

    dashboard: {
      welcome: "Welcome back",
      continueLearning:
        "Continue your cybersecurity journey.",
      level: "Level",
      points: "Points",
      labsCompleted: "Labs Completed",
      challengesSolved: "Challenges Solved",
      achievements: "Achievements",
      continueLearningTitle: "Continue Learning",
      recommended: "Recommended Challenges",
      viewAll: "View All",
      startLab: "Start Lab",
    },

    profile: {
      profile: "Profile",
      username: "Username",
      email: "Email",
      role: "Role",
      level: "Level",
      points: "Points",
      memberSince: "Member Since",
    },

    settings: {
      settings: "Settings",
      language: "Language",
      english: "English",
      amharic: "Amharic",
    },

    common: {
      english: "English",
      amharic: "አማርኛ",
    },
  },

  am: {
    navigation: {
      dashboard: "ዳሽቦርድ",
      labs: "ላቦች",
      challenges: "ቻሌንጆች",
      leaderboard: "የደረጃ ሰንጠረዥ",
      achievements: "ስኬቶች",
      profile: "መገለጫ",
      settings: "ቅንብሮች",
      logout: "ውጣ",
    },

    dashboard: {
      welcome: "እንኳን ደህና መጡ",
      continueLearning:
        "የሳይበር ደህንነት ትምህርትዎን ይቀጥሉ።",
      level: "ደረጃ",
      points: "ነጥቦች",
      labsCompleted: "የተጠናቀቁ ላቦች",
      challengesSolved: "የተፈቱ ቻሌንጆች",
      achievements: "ስኬቶች",
      continueLearningTitle: "ትምህርትዎን ይቀጥሉ",
      recommended: "የምንመክራቸው ቻሌንጆች",
      viewAll: "ሁሉንም ይመልከቱ",
      startLab: "ላብ ጀምር",
    },

    profile: {
      profile: "መገለጫ",
      username: "የተጠቃሚ ስም",
      email: "ኢሜይል",
      role: "ሚና",
      level: "ደረጃ",
      points: "ነጥቦች",
      memberSince: "አባል የሆኑበት ቀን",
    },

    settings: {
      settings: "ቅንብሮች",
      language: "ቋንቋ",
      english: "English",
      amharic: "አማርኛ",
    },

    common: {
      english: "English",
      amharic: "አማርኛ",
    },
  },
};

export type Translation = typeof translations.en;