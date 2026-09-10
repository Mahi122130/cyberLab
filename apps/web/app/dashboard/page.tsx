
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getTranslations,
  type Language,
} from "../../lib/i18n/i18n";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  points: number;
  level: number;
  created_at?: string;
};

type Lab = {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  progress: number;
};

const recommendedLabs: Lab[] = [
  {
    id: 1,
    title: "Linux Fundamentals",
    description:
      "Learn the Linux command line and essential system commands.",
    category: "LINUX",
    difficulty: "EASY",
    points: 100,
    progress: 0,
  },
  {
    id: 2,
    title: "Web Security Basics",
    description:
      "Understand common web vulnerabilities and how they work.",
    category: "WEB SECURITY",
    difficulty: "EASY",
    points: 150,
    progress: 0,
  },
  {
    id: 3,
    title: "Network Reconnaissance",
    description:
      "Learn the fundamentals of network discovery and reconnaissance.",
    category: "NETWORKING",
    difficulty: "MEDIUM",
    points: 200,
    progress: 0,
  },
];

const categories = [
  {
    key: "linux",
    name: "Linux",
    icon: "⌘",
    description: "Operating systems & command line",
    labs: 12,
  },
  {
    key: "webSecurity",
    name: "Web Security",
    icon: "◈",
    description: "Web vulnerabilities & defense",
    labs: 18,
  },
  {
    key: "networking",
    name: "Networking",
    icon: "◎",
    description: "Networks, protocols & traffic",
    labs: 14,
  },
  {
    key: "cryptography",
    name: "Cryptography",
    icon: "◇",
    description: "Encryption & security algorithms",
    labs: 10,
  },
] as const;

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // LANGUAGE
  const [language, setLanguage] = useState<Language>("en");

  const t = getTranslations(language);

  useEffect(() => {
    // -----------------------------
    // Load saved language
    // -----------------------------
    const savedLanguage =
      localStorage.getItem("cyberlab_language");

    if (savedLanguage === "en" || savedLanguage === "am") {
      setLanguage(savedLanguage);
    }

    // -----------------------------
    // Load user
    // -----------------------------
    const storedUser =
      localStorage.getItem("cyberlab_user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Invalid stored user:", error);

      localStorage.removeItem("cyberlab_user");
      localStorage.removeItem("cyberlab_token");

      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // -----------------------------
  // Change language
  // -----------------------------
  function changeLanguage() {
    const nextLanguage: Language =
      language === "en" ? "am" : "en";

    setLanguage(nextLanguage);

    localStorage.setItem(
      "cyberlab_language",
      nextLanguage,
    );
  }

  // -----------------------------
  // Logout
  // -----------------------------
  function logout() {
    localStorage.removeItem("cyberlab_user");
    localStorage.removeItem("cyberlab_token");

    router.replace("/login");
  }

  // -----------------------------
  // Loading
  // -----------------------------
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05080d] text-white">
        <div className="font-mono text-sm text-emerald-400">
          INITIALIZING CYBERLAB...
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const firstName =
    user.username.charAt(0).toUpperCase() +
    user.username.slice(1);

  const currentLevelXp = user.points % 500;

  const xpPercentage = Math.min(
    Math.round((currentLevelXp / 500) * 100),
    100,
  );

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      {/* ========================================= */}
      {/* TOP NAVIGATION */}
      {/* ========================================= */}

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#05080d]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 lg:px-8">

          {/* LOGO */}

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/10 font-mono text-sm font-bold text-emerald-400">
              &gt;_
            </div>

            <div>
              <div className="font-mono text-lg font-bold tracking-wider">
                CYBER
                <span className="text-emerald-400">
                  LAB
                </span>
              </div>

              <div className="hidden font-mono text-[7px] tracking-[0.25em] text-gray-600 sm:block">
                {t.learnPracticeSecure}
              </div>
            </div>
          </Link>

          {/* SEARCH */}

          <div className="hidden max-w-md flex-1 px-10 md:block">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-gray-600">
                /
              </span>

              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-9 pr-4 font-mono text-xs text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/30"
              />
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-4">

            {/* LANGUAGE */}

            <button
              type="button"
              onClick={changeLanguage}
              aria-label={
                language === "en"
                  ? "Switch to Amharic"
                  : "Switch to English"
              }
              className="hidden rounded-md border border-white/[0.08] px-3 py-2 font-mono text-[10px] text-gray-500 transition hover:border-emerald-400/30 hover:text-emerald-400 sm:block"
            >
              {language === "en"
                ? "EN / አማ"
                : "አማ / EN"}
            </button>

            {/* XP */}

            <div className="hidden items-center gap-2 font-mono text-xs sm:flex">
              <span className="text-emerald-400">
                ◆
              </span>

              <span className="text-gray-400">
                {user.points} {t.xp}
              </span>
            </div>

            {/* PROFILE */}

            <Link
              href="/profile"
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 font-mono text-xs font-bold text-emerald-400">
                {user.username
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="hidden sm:block">
                <div className="font-mono text-xs font-medium text-white">
                  {user.username}
                </div>

                <div className="font-mono text-[9px] text-gray-600">
                  {t.level} {user.level}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">

        {/* ========================================= */}
        {/* SIDEBAR */}
        {/* ========================================= */}

        <aside className="hidden min-h-[calc(100vh-64px)] w-64 shrink-0 border-r border-white/[0.07] lg:block">
          <div className="sticky top-16 p-5">

            <div className="mb-4 px-3 font-mono text-[9px] tracking-[0.2em] text-gray-700">
              {t.navigation}
            </div>

            <nav className="space-y-1">
              <NavItem
                href="/dashboard"
                icon="⌂"
                label={t.dashboard}
                active
              />

              <NavItem
                href="/labs"
                icon="◈"
                label={t.labs}
              />

              <NavItem
                href="/progress"
                icon="▣"
                label={t.progress}
              />

              <NavItem
                href="/leaderboard"
                icon="♛"
                label={t.leaderboard}
              />
            </nav>

            <div className="mb-4 mt-9 px-3 font-mono text-[9px] tracking-[0.2em] text-gray-700">
              {t.account}
            </div>

            <nav className="space-y-1">
              <NavItem
                href="/profile"
                icon="◉"
                label={t.profile}
              />

              <NavItem
                href="/settings"
                icon="⚙"
                label={t.settings}
              />
            </nav>

            <div className="mt-10 border-t border-white/[0.07] pt-5">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-mono text-xs text-gray-600 transition hover:bg-red-400/[0.05] hover:text-red-400"
              >
                <span>↪</span>
                {t.logout}
              </button>
            </div>

            {/* SERVER STATUS */}

            <div className="mt-8 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-wider text-gray-600">
                  {t.cyberlabStatus}
                </span>

                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              </div>

              <div className="font-mono text-[10px] text-gray-500">
                {t.systemsOperational}
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================= */}
        {/* MAIN CONTENT */}
        {/* ========================================= */}

        <section className="min-w-0 flex-1 px-5 py-7 lg:px-8">

          {/* MOBILE NAV */}

          <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            <MobileNav
              href="/dashboard"
              label={t.dashboard}
              active
            />

            <MobileNav
              href="/labs"
              label={t.labs}
            />

            <MobileNav
              href="/progress"
              label={t.progress}
            />

            <MobileNav
              href="/leaderboard"
              label={t.rank}
            />

            <MobileNav
              href="/profile"
              label={t.profile}
            />
          </div>

          {/* ========================================= */}
          {/* WELCOME */}
          {/* ========================================= */}

          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 font-mono text-[9px] tracking-[0.2em] text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

              {t.operativeOnline}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.welcomeBack}{" "}
              <span className="text-emerald-400">
                {firstName}
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              {t.welcomeDescription}
            </p>
          </div>

          {/* ========================================= */}
          {/* STATS */}
          {/* ========================================= */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t.currentLevel}
              value={`${t.level} ${user.level}`}
              icon="◆"
              description={t.keepLearning}
            />

            <StatCard
              label={t.totalXp}
              value={user.points.toString()}
              icon="★"
              description={t.experiencePoints}
            />

            <StatCard
              label={t.labsCompleted}
              value="0"
              icon="✓"
              description={t.startFirstLab}
            />

            <StatCard
              label={t.globalRank}
              value="#—"
              icon="♛"
              description={t.completeLabsRank}
            />
          </div>

          {/* ========================================= */}
          {/* LEVEL PROGRESS */}
          {/* ========================================= */}

          <div className="mt-6 rounded-xl border border-white/[0.07] bg-[#0a1019] p-5">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
                  {t.levelProgress}
                </div>

                <div className="mt-1 font-mono text-sm text-white">
                  {t.level} {user.level}

                  <span className="mx-2 text-gray-700">
                    →
                  </span>

                  {t.level} {user.level + 1}
                </div>
              </div>

              <div className="font-mono text-xs text-emerald-400">
                {currentLevelXp} / 500 {t.xp}
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                style={{
                  width: `${xpPercentage}%`,
                }}
              />
            </div>

            <div className="mt-2 font-mono text-[9px] text-gray-700">
              {500 - currentLevelXp} {t.xpRemaining}
            </div>
          </div>

          {/* ========================================= */}
          {/* CONTINUE LEARNING */}
          {/* ========================================= */}

          <div className="mt-10">
            <SectionHeader
              title={t.continueLearning}
              action={t.viewAllLabs}
              href="/labs"
            />

            <div className="mt-4">
              <div className="group rounded-xl border border-emerald-400/20 bg-gradient-to-r from-emerald-400/[0.06] to-transparent p-5 transition hover:border-emerald-400/40">

                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 font-mono text-lg text-emerald-400">
                      &gt;_
                    </div>

                    <div>

                      <div className="mb-1 font-mono text-[9px] tracking-wider text-emerald-400">
                        {t.beginnerLinux}
                      </div>

                      <h3 className="text-lg font-semibold">
                        {t.linuxFundamentals}
                      </h3>

                      <p className="mt-1 max-w-xl text-sm text-gray-500">
                        {t.linuxDescription}
                      </p>

                    </div>
                  </div>

                  <Link
                    href="/labs/1"
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400 px-5 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300"
                  >
                    {t.startLab} →
                  </Link>

                </div>
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* RECOMMENDED LABS */}
          {/* ========================================= */}

          <div className="mt-10">

            <SectionHeader
              title={t.recommendedLabs}
              action={t.exploreLabs}
              href="/labs"
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {recommendedLabs.map((lab) => (
                <LabCard
                  key={lab.id}
                  lab={lab}
                  language={language}
                />
              ))}

            </div>
          </div>

          {/* ========================================= */}
          {/* CATEGORIES */}
          {/* ========================================= */}

          <div className="mt-10">

            <SectionHeader
              title={t.exploreByCategory}
              action={t.allCategories}
              href="/labs"
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {categories.map((category) => {

                const categoryName =
                  t[
                    category.key as keyof typeof t
                  ] as string;

                const categoryDescription =
                  t[
                    `${category.key}CategoryDescription` as keyof typeof t
                  ] as string;

                return (
                  <Link
                    href={`/labs?category=${encodeURIComponent(
                      category.name,
                    )}`}
                    key={category.name}
                    className="group rounded-xl border border-white/[0.07] bg-[#0a1019] p-5 transition hover:-translate-y-0.5 hover:border-emerald-400/30"
                  >

                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] font-mono text-lg text-emerald-400">
                      {category.icon}
                    </div>

                    <h3 className="font-semibold">
                      {categoryName}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-gray-600">
                      {categoryDescription}
                    </p>

                    <div className="mt-5 font-mono text-[9px] text-gray-700">
                      {category.labs} {t.labsCount} →
                    </div>

                  </Link>
                );
              })}

            </div>
          </div>

          {/* ========================================= */}
          {/* DAILY MISSION */}
          {/* ========================================= */}

          <div className="mb-10 mt-10">

            <div className="rounded-xl border border-white/[0.07] bg-[#0a1019] p-6">

              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                <div>

                  <div className="mb-2 font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                    {t.dailyMission}
                  </div>

                  <h3 className="text-lg font-semibold">
                    {t.firstChallenge}
                  </h3>

                  <p className="mt-2 text-sm text-gray-600">
                    {t.firstChallengeDescription}
                  </p>

                </div>

                <Link
                  href="/labs"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-400/30 px-5 font-mono text-xs text-emerald-400 transition hover:bg-emerald-400/10"
                >
                  {t.findChallenge} →
                </Link>

              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}

/* ============================================= */
/* NAV ITEM */
/* ============================================= */

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-3 font-mono text-xs transition ${
        active
          ? "border border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-400"
          : "text-gray-600 hover:bg-white/[0.03] hover:text-gray-300"
      }`}
    >
      <span className="w-5 text-center text-sm">
        {icon}
      </span>

      {label}
    </Link>
  );
}

/* ============================================= */
/* MOBILE NAV */
/* ============================================= */

function MobileNav({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-lg border px-4 py-2 font-mono text-[10px] ${
        active
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
          : "border-white/[0.08] text-gray-600 hover:text-gray-300"
      }`}
    >
      {label}
    </Link>
  );
}

/* ============================================= */
/* STAT CARD */
/* ============================================= */

function StatCard({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: string;
  icon: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0a1019] p-5 transition hover:border-white/[0.12]">

      <div className="flex items-start justify-between">

        <div className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
          {label}
        </div>

        <span className="font-mono text-sm text-emerald-400">
          {icon}
        </span>

      </div>

      <div className="mt-4 text-2xl font-bold">
        {value}
      </div>

      <div className="mt-2 font-mono text-[9px] text-gray-700">
        {description}
      </div>

    </div>
  );
}

/* ============================================= */
/* SECTION HEADER */
/* ============================================= */

function SectionHeader({
  title,
  action,
  href,
}: {
  title: string;
  action: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between">

      <h2 className="font-mono text-xs font-semibold tracking-[0.15em] text-gray-400">
        {title}
      </h2>

      <Link
        href={href}
        className="font-mono text-[9px] text-gray-600 transition hover:text-emerald-400"
      >
        {action} →
      </Link>

    </div>
  );
}

/* ============================================= */
/* LAB CARD */
/* ============================================= */

function LabCard({
  lab,
  language,
}: {
  lab: Lab;
  language: Language;
}) {
  const t = getTranslations(language);

  const difficultyClass =
    lab.difficulty === "EASY"
      ? "text-emerald-400"
      : lab.difficulty === "MEDIUM"
        ? "text-yellow-400"
        : "text-red-400";

  let title = lab.title;
  let description = lab.description;

  if (lab.id === 1) {
    title = t.linuxFundamentals;
    description = t.linuxDescription;
  }

  if (lab.id === 2) {
    title = t.webSecurityBasics;
    description =
      t.webSecurityBasicsDescription;
  }

  if (lab.id === 3) {
    title = t.networkReconnaissance;
    description =
      t.networkReconnaissanceDescription;
  }

  const difficulty =
    lab.difficulty === "EASY"
      ? t.easy
      : lab.difficulty === "MEDIUM"
        ? t.medium
        : t.hard;

  return (
    <Link
      href={`/labs/${lab.id}`}
      className="group rounded-xl border border-white/[0.07] bg-[#0a1019] p-5 transition hover:-translate-y-0.5 hover:border-emerald-400/30"
    >

      <div className="flex items-start justify-between gap-4">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] font-mono text-sm text-emerald-400">
          &gt;_
        </div>

        <span
          className={`font-mono text-[9px] ${difficultyClass}`}
        >
          {difficulty}
        </span>

      </div>

      <div className="mt-5">

        <div className="font-mono text-[8px] tracking-wider text-gray-700">
          {lab.category}
        </div>

        <h3 className="mt-2 font-semibold">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-5 text-gray-600">
          {description}
        </p>

      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">

        <span className="font-mono text-[9px] text-gray-600">
          +{lab.points} {t.xp}
        </span>

        <span className="font-mono text-[9px] text-emerald-400 opacity-0 transition group-hover:opacity-100">
          {t.start} →
        </span>

      </div>

    </Link>
  );
}
