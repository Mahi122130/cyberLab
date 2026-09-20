const fs = require("fs");

let i18n = fs.readFileSync("lib/i18n/i18n.ts", "utf-8");

// Add translations
const enAdditions = `
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
`;

const amAdditions = `
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
`;

i18n = i18n.replace('en: {', 'en: {' + enAdditions);
i18n = i18n.replace('am: {', 'am: {' + amAdditions);
fs.writeFileSync("lib/i18n/i18n.ts", i18n);

// Function to replace strings in files
function replaceInFile(path, replacements, addUseI18n = true) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, "utf-8");
  
  if (addUseI18n && !content.includes('useI18n')) {
    // Add import
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { useI18n } from "@/lib/i18n/I18nProvider";');
    
    // Add hook
    if (content.includes('export default function')) {
      content = content.replace(/export default function \w+\(\) \{/, '$&\n  const { t } = useI18n();');
    }
  }

  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }
  
  fs.writeFileSync(path, content);
}

replaceInFile("app/login/page.tsx", [
  ['"Welcome back."', '{t.loginTitle}'],
  ['Welcome\\n\\n              <br />\\n\\n              <span className="text-emerald-400">\\n                back.\\n              </span>', '{t.loginTitle}'],
  ['Sign in to continue your CyberLab\\n              journey and access your cybersecurity\\n              training environment.', '{t.loginSubtitle}'],
  ['AUTHENTICATE', '{t.loginAuthenticate}'],
  ['Enter your credentials to access\\n                  CyberLab.', '{t.loginDesc}'],
  ['USERNAME OR EMAIL', '{t.usernameOrEmail}'],
  ['PASSWORD', '{t.password}'],
  ['"Show"', '{t.show}'],
  ['"Hide"', '{t.hide}'],
  ['"AUTHENTICATING..."', 't.authenticating'],
  ['"ENTER CYBERLAB →"', 't.enterCyberlab'],
  ["Don't have an account?", "{t.noAccount}"],
  ['CREATE ACCOUNT →', '{t.createAccount}'],
  ['CYBERLAB // SECURE ACCESS NODE', '{t.secureAccessNode}'],
  ['SECURE LOGIN', '{t.secureLogin}'],
  ['ACCESS // OPERATIVE LOGIN', '{t.accessOperativeLogin}'],
  ['Continue your training', '{t.continueTraining}'],
  ['Access security labs', '{t.accessSecurityLabs}'],
  ['Track your progress', '{t.trackProgress}'],
]);

replaceInFile("app/(app)/labs/page.tsx", [
  ['CYBERSECURITY TRAINING', '{t.cybersecurityTraining}'],
  ['Security Labs', '{t.securityLabs}'],
  ['Practice real cybersecurity skills\\n            through hands-on challenges. Choose\\n            a laboratory, solve the challenges and\\n            earn XP.', '{t.securityLabsDesc}'],
  ['>SEARCH<', '>{t.searchLabs}<'],
  ['"Search labs..."', 't.searchLabsPlaceholder'],
  ['>DIFFICULTY<', '>{t.difficultyLabel}<'],
  ['>All difficulties<', '>{t.allDifficulties}<'],
  ['>CATEGORY<', '>{t.categoryLabel}<'],
  ['>All categories<', '>{t.allCategoriesFilter}<'],
  ['"↻ REFRESH"', 't.refresh'],
  ['"LOADING..."', 't.loadingCaps'],
  ['API ERROR', '{t.apiError}'],
  ['TRY AGAIN', '{t.tryAgain}'],
  ['"No labs available"', 't.noLabsAvailable'],
  ['"No labs found"', 't.noLabsFound'],
  ['"There are currently no active cybersecurity laboratories available."', 't.noLabsDesc1'],
  ['"Try changing your search or filters."', 't.noLabsDesc2'],
  ['AVAILABLE LABS', '{t.availableLabs}'],
  ['LAB\\n                  {filteredLabs.length ===\\n                  1\\n                    ? ""\\n                    : "S"}', '{t.lab}{filteredLabs.length === 1 ? "" : t.labsCountSuffix}'],
  ['>CATEGORY<', '>{t.categoryLabel}<'],
  ['"TARGET"', 't.target'],
  ['"REWARD"', 't.reward'],
  ['"STATUS"', 't.status'],
  ['"ACTIVE"', 't.active'],
  ['START LAB →', '{t.startLabBtn}'],
], false);

// Wait, LabCard and Detail need t passed to them or need to use useI18n themselves.
// Since they are in the same file, let's just make them take t or move them inside.
// Actually, LabCard receives language in dashboard/page.tsx, but here it doesn't.
let labsContent = fs.readFileSync("app/(app)/labs/page.tsx", "utf-8");
if (!labsContent.includes('const { t } = useI18n();')) {
  labsContent = labsContent.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { useI18n } from "@/lib/i18n/I18nProvider";');
  labsContent = labsContent.replace('export default function LabsPage() {', 'export default function LabsPage() {\n  const { t } = useI18n();');
  // Pass t to LabCard
  labsContent = labsContent.replace(/<LabCard\s+key={lab.id}\s+lab={lab}\s*\/>/g, '<LabCard key={lab.id} lab={lab} t={t} />');
  labsContent = labsContent.replace('function LabCard({', 'function LabCard({\n  t,');
  labsContent = labsContent.replace('lab: Lab;', 'lab: Lab;\n  t: any;');
  fs.writeFileSync("app/(app)/labs/page.tsx", labsContent);
}

console.log("Refactoring complete");
