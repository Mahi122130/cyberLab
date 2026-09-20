"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  points: number;
  level: number;
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language, setLanguage } = useI18n();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("cyberlab_user");
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

  function logout() {
    localStorage.removeItem("cyberlab_user");
    localStorage.removeItem("cyberlab_token");
    router.replace("/login");
  }

  function changeLanguage() {
    const nextLanguage = language === "en" ? "am" : "en";
    setLanguage(nextLanguage);
  }

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

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#05080d]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/10 font-mono text-sm font-bold text-emerald-400">
              &gt;_
            </div>
            <div>
              <div className="font-mono text-lg font-bold tracking-wider">
                CYBER<span className="text-emerald-400">LAB</span>
              </div>
              <div className="hidden font-mono text-[7px] tracking-[0.25em] text-gray-600 sm:block">
                {t.learnPracticeSecure || "LEARN // PRACTICE // SECURE"}
              </div>
            </div>
          </Link>

          <div className="hidden max-w-md flex-1 px-10 md:block">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-gray-600">/</span>
              <input
                type="text"
                placeholder={t.searchPlaceholder || "Search labs, challenges..."}
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-9 pr-4 font-mono text-xs text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={changeLanguage}
              aria-label="Switch Language"
              className="hidden rounded-md border border-white/[0.08] px-3 py-2 font-mono text-[10px] text-gray-500 transition hover:border-emerald-400/30 hover:text-emerald-400 sm:block"
            >
              {language === "en" ? "EN / አማ" : "አማ / EN"}
            </button>

            <div className="hidden items-center gap-2 font-mono text-xs sm:flex">
              <span className="text-emerald-400">◆</span>
              <span className="text-gray-400">{user.points} {t.xp || "XP"}</span>
            </div>

            <Link href="/profile" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 font-mono text-xs font-bold text-emerald-400">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="font-mono text-xs font-medium text-white">{user.username}</div>
                <div className="font-mono text-[9px] text-gray-600">
                  {t.level || "LEVEL"} {user.level}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden min-h-[calc(100vh-64px)] w-64 shrink-0 border-r border-white/[0.07] lg:block">
          <div className="sticky top-16 p-5">
            <div className="mb-4 px-3 font-mono text-[9px] tracking-[0.2em] text-gray-700">
              {t.navigation || "NAVIGATION"}
            </div>
            <nav className="space-y-1">
              <NavItem href="/dashboard" icon="⌂" label={t.dashboard || "Dashboard"} active={pathname === "/dashboard"} />
              <NavItem href="/labs" icon="◈" label={t.labs || "Labs"} active={pathname.startsWith("/labs")} />
              <NavItem href="/progress" icon="▣" label={t.progress || "Progress"} active={pathname === "/progress"} />
              <NavItem href="/leaderboard" icon="♛" label={t.leaderboard || "Leaderboard"} active={pathname === "/leaderboard"} />
            </nav>

            <div className="mb-4 mt-9 px-3 font-mono text-[9px] tracking-[0.2em] text-gray-700">
              {t.account || "ACCOUNT"}
            </div>
            <nav className="space-y-1">
              <NavItem href="/profile" icon="◉" label={t.profile || "Profile"} active={pathname === "/profile"} />
              <NavItem href="/settings" icon="⚙" label={t.settings || "Settings"} active={pathname === "/settings"} />
            </nav>

            <div className="mt-10 border-t border-white/[0.07] pt-5">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-mono text-xs text-gray-600 transition hover:bg-red-400/[0.05] hover:text-red-400"
              >
                <span>↪</span>
                {t.logout || "Logout"}
              </button>
            </div>

            <div className="mt-8 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-wider text-gray-600">
                  {t.cyberlabStatus || "CYBERLAB STATUS"}
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              </div>
              <div className="font-mono text-[10px] text-gray-500">
                {t.systemsOperational || "All systems operational"}
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-7 lg:px-8">
          <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            <MobileNav href="/dashboard" label={t.dashboard || "Dashboard"} active={pathname === "/dashboard"} />
            <MobileNav href="/labs" label={t.labs || "Labs"} active={pathname.startsWith("/labs")} />
            <MobileNav href="/progress" label={t.progress || "Progress"} active={pathname === "/progress"} />
            <MobileNav href="/leaderboard" label={t.rank || "Rank"} active={pathname === "/leaderboard"} />
            <MobileNav href="/profile" label={t.profile || "Profile"} active={pathname === "/profile"} />
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-3 font-mono text-xs transition ${
        active
          ? "border border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-400"
          : "text-gray-600 hover:bg-white/[0.03] hover:text-gray-300"
      }`}
    >
      <span className="w-5 text-center text-sm">{icon}</span>
      {label}
    </Link>
  );
}

function MobileNav({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
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
