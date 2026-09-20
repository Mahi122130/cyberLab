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

type LabProgress = {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  total_challenges: number;
  solved_challenges: number;
  progress_pct: number;
};


function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    EASY: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
    MEDIUM: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
    HARD: "text-red-400 border-red-400/30 bg-red-400/5",
  };
  return (
    <span
      className={`rounded border px-2 py-0.5 font-mono text-[9px] tracking-wider ${
        styles[difficulty] || styles["EASY"]
      }`}
    >
      {difficulty}
    </span>
  );
}

export default function ProgressPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [labs, setLabs] = useState<LabProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");

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

    fetch(`${API_URL}/users/me/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLabs(data.data);
        } else {
          setError("Failed to load progress data.");
        }
      })
      .catch(() => setError("Could not connect to server."))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d] text-white">
        <div className="font-mono text-sm text-emerald-400">
          LOADING PROGRESS...
        </div>
    </div>
    );
  }

  if (!user) return null;

  const categories = ["ALL", ...Array.from(new Set(labs.map((l) => l.category)))];
  const filtered = filterCategory === "ALL" ? labs : labs.filter((l) => l.category === filterCategory);

  const totalLabs = labs.length;
  const completedLabs = labs.filter((l) => l.progress_pct === 100).length;
  const totalChallenges = labs.reduce((acc, l) => acc + Number(l.total_challenges), 0);
  const solvedChallenges = labs.reduce((acc, l) => acc + Number(l.solved_challenges), 0);
  const overallPct = totalChallenges === 0 ? 0 : Math.round((solvedChallenges / totalChallenges) * 100);

  return (
    <>
      {/* HEADER */}
          <div className="mb-8">
            <div className="mb-1 font-mono text-[9px] tracking-[0.3em] text-emerald-400/70">
              TRACKING
            </div>
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              My Progress
            </h1>
            <p className="mt-1 font-mono text-xs text-gray-500">
              Track your completion across all labs and challenges
            </p>
          </div>

          {/* OVERVIEW STATS */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Overall Progress", value: `${overallPct}%`, sub: "challenges completed" },
              { label: "Labs Completed", value: `${completedLabs}/${totalLabs}`, sub: "full completion" },
              { label: "Challenges Solved", value: `${solvedChallenges}/${totalChallenges}`, sub: "total challenges" },
              { label: "Total Points", value: user.points.toLocaleString(), sub: "XP earned" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
              >
                <div className="mb-1 font-mono text-[9px] tracking-wider text-gray-600">
                  {stat.label.toUpperCase()}
                </div>
                <div className="font-mono text-xl font-bold text-emerald-400">
                  {stat.value}
                </div>
                <div className="font-mono text-[10px] text-gray-600">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* OVERALL PROGRESS BAR */}
          <div className="mb-8 rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs text-gray-400">Overall completion</span>
              <span className="font-mono text-sm font-bold text-emerald-400">{overallPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`shrink-0 rounded-lg border px-3 py-1.5 font-mono text-[10px] tracking-wider transition ${
                  filterCategory === cat
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                    : "border-white/[0.08] text-gray-500 hover:border-white/20 hover:text-gray-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center font-mono text-sm text-red-400">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] py-16 text-center font-mono text-sm text-gray-600">
              No labs found.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((lab) => {
                const pct = Number(lab.progress_pct);
                const completed = pct === 100;

                return (
                  <div
                    key={lab.id}
                    className={`rounded-xl border p-5 transition ${
                      completed
                        ? "border-emerald-400/20 bg-emerald-400/[0.03]"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold text-white">
                            {lab.title}
                          </span>
                          <DifficultyBadge difficulty={lab.difficulty} />
                          {completed && (
                            <span className="rounded border border-emerald-400/30 bg-emerald-400/5 px-2 py-0.5 font-mono text-[9px] tracking-wider text-emerald-400">
                              COMPLETED ✓
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-gray-600 mb-3">
                          {lab.category} · {lab.solved_challenges}/{lab.total_challenges} challenges
                        </div>
                        {/* PROGRESS BAR */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                completed
                                  ? "bg-emerald-400"
                                  : pct > 0
                                  ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                                  : "bg-gray-700"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-gray-500 shrink-0">
                            {pct}%
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="font-mono text-sm font-bold text-emerald-400">
                          {lab.points}
                        </div>
                        <div className="font-mono text-[9px] text-gray-600">pts</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
    </>
  );
}
