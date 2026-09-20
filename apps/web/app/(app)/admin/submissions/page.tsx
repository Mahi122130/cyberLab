"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1";

type Submission = {
  id: number;
  user_id: number;
  username: string;
  challenge_id: number;
  challenge_title: string;
  flag: string;
  is_correct: boolean | number;
  submitted_at: string;
  points_awarded: number;
};

export default function AdminSubmissionsPage() {
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | "CORRECT" | "WRONG">("ALL");

  useEffect(() => {
    const token = localStorage.getItem("cyberlab_token");
    const storedUser = localStorage.getItem("cyberlab_user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    fetch(`${API_URL}/submissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Failed to load submissions (${res.status}): ${text}`
          );
        }
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setSubmissions(list);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load submissions."
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = submissions.filter((s) => {
    if (filter === "CORRECT") return s.is_correct === true || s.is_correct === 1;
    if (filter === "WRONG") return !s.is_correct || s.is_correct === 0;
    return true;
  });

  const correctCount = submissions.filter(
    (s) => s.is_correct === true || s.is_correct === 1
  ).length;

  const wrongCount = submissions.length - correctCount;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-sm text-emerald-400">
            LOADING SUBMISSIONS...
          </div>
          <div className="mt-2 font-mono text-[10px] text-gray-600">
            Fetching submission data
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="mb-8">
        <div className="font-mono text-[9px] tracking-[0.3em] text-emerald-400/70">
          ADMIN / SUBMISSIONS
        </div>
        <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight">
          Flag Submissions
        </h1>
        <p className="mt-1 font-mono text-xs text-gray-500">
          Review all flag submissions across all challenges
        </p>
      </div>

      {/* STATS ROW */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "TOTAL", value: submissions.length, color: "text-white" },
          { label: "CORRECT", value: correctCount, color: "text-emerald-400" },
          { label: "WRONG", value: wrongCount, color: "text-red-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
          >
            <div className="font-mono text-[9px] tracking-wider text-gray-600">
              {stat.label}
            </div>
            <div className={`mt-2 font-mono text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="mb-4 flex gap-2">
        {(["ALL", "CORRECT", "WRONG"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-4 py-2 font-mono text-[10px] tracking-wider transition ${
              filter === f
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                : "border-white/[0.08] text-gray-500 hover:border-white/20 hover:text-gray-400"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 p-5">
          <div className="font-mono text-xs font-semibold text-red-400">
            ERROR
          </div>
          <p className="mt-2 font-mono text-xs leading-5 text-red-300/70">
            {error}
          </p>
        </div>
      )}

      {/* TABLE */}
      {!error && (
        <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
          {/* TABLE HEADER */}
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_80px_120px] border-b border-white/[0.07] px-5 py-3">
            <div className="font-mono text-[9px] tracking-wider text-gray-600">ID</div>
            <div className="font-mono text-[9px] tracking-wider text-gray-600">USER</div>
            <div className="font-mono text-[9px] tracking-wider text-gray-600">CHALLENGE</div>
            <div className="font-mono text-[9px] tracking-wider text-gray-600">FLAG</div>
            <div className="font-mono text-[9px] tracking-wider text-gray-600">RESULT</div>
            <div className="font-mono text-[9px] tracking-wider text-gray-600">SUBMITTED</div>
          </div>

          {/* ROWS */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center font-mono text-sm text-gray-600">
              {submissions.length === 0
                ? "No submissions yet."
                : "No submissions match this filter."}
            </div>
          ) : (
            filtered.map((sub) => {
              const correct =
                sub.is_correct === true || sub.is_correct === 1;
              const date = sub.submitted_at
                ? new Date(sub.submitted_at).toLocaleString()
                : "—";

              return (
                <div
                  key={sub.id}
                  className="grid grid-cols-[60px_1fr_1fr_1fr_80px_120px] items-center border-b border-white/[0.04] px-5 py-4 transition hover:bg-white/[0.025]"
                >
                  <div className="font-mono text-xs text-gray-600">
                    #{sub.id}
                  </div>

                  <div className="font-mono text-xs text-white">
                    {sub.username || `User #${sub.user_id}`}
                  </div>

                  <div className="font-mono text-xs text-gray-400">
                    {sub.challenge_title || `Challenge #${sub.challenge_id}`}
                  </div>

                  <div className="max-w-[180px] truncate font-mono text-[10px] text-gray-600">
                    {sub.flag}
                  </div>

                  <div>
                    <span
                      className={`rounded border px-2 py-0.5 font-mono text-[9px] tracking-wider ${
                        correct
                          ? "border-emerald-400/30 bg-emerald-400/5 text-emerald-400"
                          : "border-red-400/30 bg-red-400/5 text-red-400"
                      }`}
                    >
                      {correct ? "✓ CORRECT" : "✗ WRONG"}
                    </span>
                  </div>

                  <div className="font-mono text-[10px] text-gray-600">
                    {date}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </>
  );
}
