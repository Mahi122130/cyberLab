"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  points: number;
  level: number;
};

type LeaderboardEntry = {
  id: number;
  username: string;
  points: number;
  challenges_solved: number;
  rank: number;
};

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
          ? "bg-emerald-400/10 text-emerald-400"
          : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300"
      }`}
    >
      <span>{icon}</span>
      {label}
    </Link>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function logout() {
    localStorage.removeItem("cyberlab_user");
    localStorage.removeItem("cyberlab_token");
    router.replace("/login");
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("cyberlab_user");
    const token = localStorage.getItem("cyberlab_token");

    if (!storedUser || !token) {
      router.replace("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      router.replace("/login");
      return;
    }

    fetch(`${API_URL}/leaderboard?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeaderboard(data.data);
        } else {
          setError("Failed to load leaderboard.");
        }
      })
      .catch(() => setError("Could not connect to server."))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05080d] text-white">
        <div className="font-mono text-sm text-emerald-400">
          LOADING LEADERBOARD...
        </div>
      </main>
    );
  }

  if (!user) return null;

  const myRank = leaderboard.find((e) => e.id === user.id);

  function getRankStyle(rank: number) {
    if (rank === 1) return "text-yellow-400 font-bold";
    if (rank === 2) return "text-gray-300 font-bold";
    if (rank === 3) return "text-amber-600 font-bold";
    return "text-gray-500";
  }

  function getRankIcon(rank: number) {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  }

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#05080d]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/10 font-mono text-sm font-bold text-emerald-400">
              &gt;_
            </div>
            <div className="font-mono text-lg font-bold tracking-wider">
              CYBER<span className="text-emerald-400">LAB</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 font-mono text-xs sm:flex">
              <span className="text-emerald-400">◆</span>
              <span className="text-gray-400">{user.points} XP</span>
            </div>
            <Link href="/profile" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 font-mono text-xs font-bold text-emerald-400">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="font-mono text-xs font-medium">{user.username}</div>
                <div className="font-mono text-[9px] text-gray-600">Level {user.level}</div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        {/* SIDEBAR */}
        <aside className="hidden min-h-[calc(100vh-64px)] w-64 shrink-0 border-r border-white/[0.07] lg:block">
          <div className="sticky top-16 p-5">
            <div className="mb-4 px-3 font-mono text-[9px] tracking-[0.2em] text-gray-700">
              NAVIGATION
            </div>
            <nav className="space-y-1">
              <NavItem href="/dashboard" icon="⌂" label="Dashboard" />
              <NavItem href="/labs" icon="◈" label="Labs" />
              <NavItem href="/progress" icon="▣" label="Progress" />
              <NavItem href="/leaderboard" icon="♛" label="Leaderboard" active />
            </nav>
            <div className="mb-4 mt-9 px-3 font-mono text-[9px] tracking-[0.2em] text-gray-700">
              ACCOUNT
            </div>
            <nav className="space-y-1">
              <NavItem href="/profile" icon="◉" label="Profile" />
              <NavItem href="/settings" icon="⚙" label="Settings" />
            </nav>
            <div className="mt-10 border-t border-white/[0.07] pt-5">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-mono text-xs text-gray-600 transition hover:bg-red-400/[0.05] hover:text-red-400"
              >
                <span>↪</span> Logout
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="min-w-0 flex-1 px-5 py-7 lg:px-8">
          {/* HEADER */}
          <div className="mb-8">
            <div className="mb-1 font-mono text-[9px] tracking-[0.3em] text-emerald-400/70">
              RANKINGS
            </div>
            <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
              Leaderboard
            </h1>
            <p className="mt-1 font-mono text-xs text-gray-500">
              Top hackers ranked by total points earned
            </p>
          </div>

          {/* MY RANK BANNER */}
          {myRank && (
            <div className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-gray-400">
                  Your ranking
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-gray-500">
                    {myRank.challenges_solved} challenges solved
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {myRank.points} pts
                  </span>
                  <span className={`font-mono text-lg ${getRankStyle(myRank.rank)}`}>
                    {getRankIcon(myRank.rank)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error ? (
            <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center font-mono text-sm text-red-400">
              {error}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
              {/* TABLE HEADER */}
              <div className="grid grid-cols-[60px_1fr_120px_120px] border-b border-white/[0.07] px-5 py-3">
                <div className="font-mono text-[9px] tracking-wider text-gray-600">RANK</div>
                <div className="font-mono text-[9px] tracking-wider text-gray-600">OPERATIVE</div>
                <div className="text-right font-mono text-[9px] tracking-wider text-gray-600">SOLVED</div>
                <div className="text-right font-mono text-[9px] tracking-wider text-gray-600">POINTS</div>
              </div>

              {/* ROWS */}
              {leaderboard.length === 0 ? (
                <div className="py-16 text-center font-mono text-sm text-gray-600">
                  No data yet. Be the first to solve a challenge!
                </div>
              ) : (
                leaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-[60px_1fr_120px_120px] items-center border-b border-white/[0.04] px-5 py-4 transition hover:bg-white/[0.025] ${
                      entry.id === user.id ? "bg-emerald-400/[0.04]" : ""
                    }`}
                  >
                    {/* RANK */}
                    <div className={`font-mono text-sm ${getRankStyle(entry.rank)}`}>
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* USERNAME */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] font-mono text-xs font-bold text-gray-400">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={`font-mono text-sm ${entry.id === user.id ? "text-emerald-400" : "text-white"}`}>
                          {entry.username}
                          {entry.id === user.id && (
                            <span className="ml-2 font-mono text-[9px] text-emerald-400/60">(you)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SOLVED */}
                    <div className="text-right font-mono text-xs text-gray-400">
                      {entry.challenges_solved}
                    </div>

                    {/* POINTS */}
                    <div className="text-right font-mono text-sm font-bold text-emerald-400">
                      {entry.points}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
