"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1";

type Challenge = {
  id: number;
  lab_id: number;
  title: string;
  description: string;
  task: string;
  flag: string;
  points: number;
  order_number: number;
  is_active: boolean | number | string;
};

export default function AdminChallengeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const challengeId = Number(params?.id);

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    if (!challengeId || isNaN(challengeId)) {
      setError("Invalid challenge ID.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/challenges/${challengeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load challenge (${res.status}): ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        setChallenge(data?.challenge ?? data?.data ?? data);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load challenge."
        );
      })
      .finally(() => setLoading(false));
  }, [router, challengeId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="font-mono text-sm text-emerald-400">
          LOADING CHALLENGE...
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-8 text-center">
        <div className="font-mono text-xs font-semibold text-red-400">ERROR</div>
        <p className="mt-3 font-mono text-xs text-red-300/70">
          {error || "Challenge not found."}
        </p>
        <Link
          href="/admin/challenges"
          className="mt-6 inline-block font-mono text-xs text-emerald-400 hover:text-emerald-300"
        >
          ← Back to Challenges
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* BREADCRUMB */}
      <div className="mb-6 font-mono text-[9px] tracking-[0.2em] text-gray-600">
        <Link href="/admin" className="hover:text-emerald-400">ADMIN</Link>
        {" / "}
        <Link href="/admin/challenges" className="hover:text-emerald-400">CHALLENGES</Link>
        {" / "}
        <span className="text-gray-400">#{challenge.id}</span>
      </div>

      {/* HEADER */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[9px] tracking-[0.3em] text-emerald-400/70">
            CHALLENGE DETAIL
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight">
            {challenge.title}
          </h1>
          <p className="mt-1 font-mono text-xs text-gray-500">
            Lab #{challenge.lab_id} · Order #{challenge.order_number} · {challenge.points} pts
          </p>
        </div>

        <Link
          href={`/admin/challenges`}
          className="shrink-0 rounded-lg border border-white/[0.08] px-4 py-2 font-mono text-[10px] text-gray-400 transition hover:border-emerald-400/30 hover:text-emerald-400"
        >
          ← BACK
        </Link>
      </div>

      {/* DETAILS */}
      <div className="space-y-5">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="mb-2 font-mono text-[9px] tracking-wider text-gray-600">DESCRIPTION</div>
          <p className="font-mono text-sm leading-6 text-gray-300">{challenge.description || "—"}</p>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="mb-2 font-mono text-[9px] tracking-wider text-gray-600">TASK</div>
          <p className="font-mono text-sm leading-6 text-gray-300">{challenge.task || "—"}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="mb-2 font-mono text-[9px] tracking-wider text-gray-600">POINTS</div>
            <div className="font-mono text-xl font-bold text-emerald-400">{challenge.points}</div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="mb-2 font-mono text-[9px] tracking-wider text-gray-600">STATUS</div>
            <span className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
              challenge.is_active
                ? "border-emerald-400/30 bg-emerald-400/5 text-emerald-400"
                : "border-gray-600 bg-white/5 text-gray-500"
            }`}>
              {challenge.is_active ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
        </div>

        {challenge.flag && (
          <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-5">
            <div className="mb-2 font-mono text-[9px] tracking-wider text-yellow-600">FLAG (ADMIN ONLY)</div>
            <code className="font-mono text-sm text-yellow-400">{challenge.flag}</code>
          </div>
        )}
      </div>
    </>
  );
}
