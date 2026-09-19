
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  points: number;
  level: number;
  created_at?: string;
};

type UserStats = {
  totalPoints: number;
  challengesSolved: number;
  labsCompleted: number;
  globalRank: number;
  totalStudents: number;
  level: number;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("cyberlab_user");
    const token = localStorage.getItem("cyberlab_token");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);

      if (token) {
        fetch("http://localhost:5001/api/v1/users/me/stats", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.data?.stats) {
              setStats(data.data.stats);
            }
            if (data?.data?.user) {
              setUser((prev) => ({ ...prev, ...data.data.user }));
            }
          })
          .catch((err) => console.error("Failed to load user stats:", err));
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      localStorage.removeItem("cyberlab_user");
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05080d] text-white">
        <div className="font-mono text-sm text-emerald-400">
          LOADING OPERATIVE PROFILE...
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const joinedDate = user.created_at
    ? new Date(
        user.created_at,
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  const initial = user.username
    .charAt(0)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#05080d]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 lg:px-8">
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
                LEARN // PRACTICE // SECURE
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/[0.08] px-4 py-2 font-mono text-[10px] text-gray-500 transition hover:border-emerald-400/30 hover:text-emerald-400"
            >
              ← DASHBOARD
            </Link>

            <button
              onClick={logout}
              className="rounded-lg border border-red-400/20 px-4 py-2 font-mono text-[10px] text-red-400 transition hover:bg-red-400/10"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <section className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        {/* TITLE */}

        <div className="mb-8">
          <div className="mb-3 font-mono text-[9px] tracking-[0.2em] text-emerald-400">
            OPERATIVE // PROFILE
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your CyberLab identity and view
            your cybersecurity progress.
          </p>
        </div>

        {/* PROFILE HEADER */}

        <div className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 font-mono text-3xl font-bold text-emerald-400">
                {initial}
              </div>

              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                  CYBERLAB OPERATIVE
                </div>

                <h2 className="mt-2 text-2xl font-bold">
                  {user.username}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] px-5 py-4">
              <div className="font-mono text-[9px] tracking-wider text-gray-600">
                ACCOUNT ROLE
              </div>

              <div className="mt-2 font-mono text-sm text-emerald-400">
                {user.role}
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProfileStat
            label="LEVEL"
            value={`LEVEL ${user.level}`}
            icon="◆"
          />

          <ProfileStat
            label="EXPERIENCE"
            value={`${stats?.totalPoints ?? user.points} XP`}
            icon="★"
          />

          <ProfileStat
            label="LABS COMPLETED"
            value={stats ? String(stats.labsCompleted) : "0"}
            icon="✓"
          />

          <ProfileStat
            label="RANK"
            value={stats?.globalRank ? `#${stats.globalRank}` : "#—"}
            icon="♛"
          />
        </div>

        {/* ACCOUNT INFORMATION */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6">
            <div className="mb-6">
              <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
                ACCOUNT INFORMATION
              </div>

              <h2 className="mt-2 text-lg font-semibold">
                Identity
              </h2>
            </div>

            <div className="space-y-5">
              <InfoRow
                label="USER ID"
                value={`#${user.id}`}
              />

              <InfoRow
                label="USERNAME"
                value={user.username}
              />

              <InfoRow
                label="EMAIL"
                value={user.email}
              />

              <InfoRow
                label="ROLE"
                value={user.role}
              />

              <InfoRow
                label="JOINED"
                value={joinedDate}
              />
            </div>
          </div>

          {/* LEVEL */}

          <div className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6">
            <div className="mb-6">
              <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
                OPERATIVE PROGRESSION
              </div>

              <h2 className="mt-2 text-lg font-semibold">
                Level {user.level}
              </h2>
            </div>

            <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-500">
                  CURRENT XP
                </span>

                <span className="font-mono text-xs text-emerald-400">
                  {user.points} XP
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{
                    width: `${Math.min(
                      (user.points % 500) / 5,
                      100,
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between font-mono text-[9px] text-gray-700">
                <span>
                  LEVEL {user.level}
                </span>

                <span>
                  LEVEL {user.level + 1}
                </span>
              </div>
            </div>

            <div className="mt-5 text-sm leading-6 text-gray-600">
              Complete practical cybersecurity
              labs, solve challenges and earn XP to
              increase your level.
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="mt-8 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6">
          <div className="mb-6">
            <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
              QUICK ACTIONS
            </div>

            <h2 className="mt-2 text-lg font-semibold">
              Continue your journey
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              href="/labs"
              icon="◈"
              title="Explore Labs"
              description="Find a new challenge"
            />

            <QuickAction
              href="/progress"
              icon="▣"
              title="My Progress"
              description="View your achievements"
            />

            <QuickAction
              href="/leaderboard"
              icon="♛"
              title="Leaderboard"
              description="See your ranking"
            />

            <QuickAction
              href="/settings"
              icon="⚙"
              title="Settings"
              description="Manage preferences"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0a1019] p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
          {label}
        </span>

        <span className="text-sm text-emerald-400">
          {icon}
        </span>
      </div>

      <div className="mt-4 text-xl font-bold">
        {value}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] pb-4 last:border-0 last:pb-0">
      <span className="font-mono text-[9px] tracking-wider text-gray-700">
        {label}
      </span>

      <span className="max-w-[65%] truncate text-right text-sm text-gray-400">
        {value}
      </span>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-white/[0.07] bg-white/[0.015] p-4 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.03]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-sm text-emerald-400">
          {icon}
        </div>

        <div>
          <div className="text-sm font-medium group-hover:text-emerald-400">
            {title}
          </div>

          <div className="mt-1 text-[10px] text-gray-700">
            {description}
          </div>
        </div>
      </div>
    </Link>
  );
}

