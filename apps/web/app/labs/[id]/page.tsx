
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

type TargetType =
  | "WEB"
  | "LINUX"
  | "NETWORK"
  | "CRYPTO";

type Lab = {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  points: number;
  target_type: TargetType;
  target_url: string | null;
  docker_image: string | null;
  is_active: number | boolean;
  created_at: string;
};

type Challenge = {
  id: number;
  lab_id: number;
  title: string;
  description: string | null;
  task: string;
  points: number;
  order_number: number;
  is_active: number | boolean;
  created_at: string;
};

type ChallengesResponse = {
  success: boolean;
  lab_id: number;
  challenges: Challenge[];
};

export default function LabPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;

  const labId = Number(
    Array.isArray(rawId) ? rawId[0] : rawId
  );

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5001/api/v1";

  const [lab, setLab] = useState<Lab | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!labId || Number.isNaN(labId)) {
      setError("Invalid lab ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadLab = async () => {
      try {
        setLoading(true);
        setError("");

        // ============================================================
        // GET LAB
        // Backend returns the lab object directly:
        //
        // {
        //   id: 5,
        //   title: "...",
        //   ...
        // }
        // ============================================================

        const labEndpoint = `${API_URL}/labs/${labId}`;

        console.log("====================================");
        console.log("CYBERLAB - LOAD LAB");
        console.log("Lab ID:", labId);
        console.log("API URL:", API_URL);
        console.log("Lab Endpoint:", labEndpoint);
        console.log("====================================");

        const labResponse = await fetch(labEndpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!labResponse.ok) {
          let message = `Failed to load lab. Server returned ${labResponse.status}.`;

          try {
            const errorData = await labResponse.json();

            if (
              typeof errorData?.message === "string"
            ) {
              message = errorData.message;
            }
          } catch {
            // Keep default message
          }

          throw new Error(message);
        }

        const labData: Lab = await labResponse.json();

        console.log("Lab response:", labData);

        // IMPORTANT:
        // The API returns the lab directly.
        if (!labData || typeof labData.id !== "number") {
          throw new Error("Lab was not found.");
        }

        if (cancelled) {
          return;
        }

        setLab(labData);

        // ============================================================
        // GET CHALLENGES
        // ============================================================

        const challengesEndpoint =
          `${API_URL}/labs/${labId}/challenges`;

        const challengesResponse = await fetch(
          challengesEndpoint,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (!challengesResponse.ok) {
          let message =
            `Failed to load challenges. Server returned ${challengesResponse.status}.`;

          try {
            const errorData =
              await challengesResponse.json();

            if (
              typeof errorData?.message === "string"
            ) {
              message = errorData.message;
            }
          } catch {
            // Keep default message
          }

          throw new Error(message);
        }

        const challengesData: ChallengesResponse =
          await challengesResponse.json();

        console.log(
          "Challenges response:",
          challengesData
        );

        if (
          !challengesData ||
          !Array.isArray(
            challengesData.challenges
          )
        ) {
          throw new Error(
            "Invalid challenges response."
          );
        }

        // ============================================================
        // ONLY ACTIVE CHALLENGES
        // ============================================================

        const activeChallenges =
          challengesData.challenges.filter(
            (challenge) =>
              challenge.lab_id === labId &&
              (
                challenge.is_active === true ||
                challenge.is_active === 1 ||
                String(
                  challenge.is_active
                ) === "1" ||
                String(
                  challenge.is_active
                ).toLowerCase() === "true"
              )
          );

        // Sort by order number
        activeChallenges.sort(
          (a, b) =>
            Number(a.order_number || 0) -
            Number(b.order_number || 0)
        );

        if (!cancelled) {
          setChallenges(activeChallenges);
        }
      } catch (err) {
        console.error(
          "Failed to load lab:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load lab."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLab();

    return () => {
      cancelled = true;
    };
  }, [labId, API_URL]);

  // ================================================================
  // FIRST CHALLENGE
  // ================================================================

  const firstActiveChallenge =
    useMemo(
      () => challenges[0] ?? null,
      [challenges]
    );

  // ================================================================
  // START LAB
  // ================================================================

  const handleStartLab = () => {
    if (starting) {
      return;
    }

    if (!firstActiveChallenge) {
      setError(
        "This lab does not have any active challenges yet."
      );
      return;
    }

    setStarting(true);

    router.push(
      `/labs/${labId}/challenge/${firstActiveChallenge.id}`
    );
  };

  // ================================================================
  // LOADING
  // ================================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05080d] text-white">
        <div className="text-center">
          <div className="font-mono text-sm text-emerald-400">
            LOADING LAB...
          </div>

          <div className="mt-3 font-mono text-xs text-gray-600">
            Fetching lab data from server
          </div>

          <div className="mt-5 h-1 w-48 overflow-hidden rounded-full bg-white/[0.05]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-400" />
          </div>
        </div>
      </main>
    );
  }

  // ================================================================
  // ERROR
  // ================================================================

  if (error || !lab) {
    return (
      <main className="min-h-screen bg-[#05080d] text-white">
        <header className="border-b border-white/[0.07] bg-[#05080d]">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8">
            <Link
              href="/dashboard"
              className="font-mono text-lg font-bold tracking-wider"
            >
              CYBER
              <span className="text-emerald-400">
                LAB
              </span>
            </Link>

            <Link
              href="/labs"
              className="font-mono text-xs text-gray-500 transition hover:text-emerald-400"
            >
              ← ALL LABS
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-[900px] px-5 py-20">
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.03] p-10 text-center">
            <div className="font-mono text-xs tracking-wider text-red-400">
              ERROR
            </div>

            <h1 className="mt-4 text-2xl font-bold">
              Unable to load lab
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-500">
              {error || "Lab not found."}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="inline-flex h-11 items-center rounded-lg bg-emerald-400 px-6 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300"
              >
                TRY AGAIN
              </button>

              <Link
                href="/labs"
                className="inline-flex h-11 items-center rounded-lg border border-white/[0.08] px-6 font-mono text-xs text-gray-400 transition hover:border-emerald-400/30 hover:text-emerald-400"
              >
                ← ALL LABS
              </Link>
            </div>

            <div className="mt-8 rounded-lg border border-white/[0.06] bg-black/20 p-4 text-left">
              <div className="font-mono text-[10px] tracking-wider text-gray-600">
                DEBUG INFORMATION
              </div>

              <div className="mt-3 font-mono text-xs text-gray-500">
                Lab ID:
                <span className="ml-2 text-gray-300">
                  {String(labId)}
                </span>
              </div>

              <div className="mt-2 break-all font-mono text-xs text-gray-500">
                API:
                <span className="ml-2 text-gray-300">
                  {API_URL}
                </span>
              </div>

              <div className="mt-2 break-all font-mono text-xs text-gray-500">
                Endpoint:
                <span className="ml-2 text-gray-300">
                  {`${API_URL}/labs/${labId}`}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ================================================================
  // DIFFICULTY
  // ================================================================

  const difficultyClass =
    lab.difficulty === "EASY"
      ? "text-emerald-400"
      : lab.difficulty === "MEDIUM"
        ? "text-yellow-400"
        : "text-red-400";

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <header className="border-b border-white/[0.07] bg-[#05080d]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8">
          <Link
            href="/dashboard"
            className="font-mono text-lg font-bold tracking-wider"
          >
            CYBER
            <span className="text-emerald-400">
              LAB
            </span>
          </Link>

          <Link
            href="/labs"
            className="font-mono text-xs text-gray-500 transition hover:text-emerald-400"
          >
            ← ALL LABS
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-5 py-10 lg:px-8">
        {/* BREADCRUMB */}

        <div className="mb-8 font-mono text-[9px] tracking-[0.15em] text-gray-600">
          CYBERLAB / LABS /{" "}
          {lab.category?.toUpperCase() || "LAB"}
        </div>

        {/* HERO */}

        <div className="rounded-2xl border border-emerald-400/20 bg-[#0a1019] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div>
              <div className="mb-3 font-mono text-[9px] tracking-wider text-emerald-400">
                {lab.category?.toUpperCase() ||
                  "LAB"}
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                {lab.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500">
                {lab.description}
              </p>
            </div>

            <div className="shrink-0">
              <div
                className={`font-mono text-xs ${difficultyClass}`}
              >
                {lab.difficulty}
              </div>

              <div className="mt-2 font-mono text-xs text-gray-500">
                +{lab.points} XP
              </div>
            </div>
          </div>
        </div>

        {/* LAB INFORMATION */}

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <InfoCard
            label="CATEGORY"
            value={lab.category}
          />

          <InfoCard
            label="TARGET"
            value={lab.target_type}
          />

          <InfoCard
            label="REWARD"
            value={`+${lab.points} XP`}
            accent
          />
        </div>

        {/* TARGET URL */}

        {lab.target_url && (
          <div className="mt-6 rounded-xl border border-white/[0.07] bg-[#0a1019] p-5">
            <div className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
              TARGET URL
            </div>

            <div className="mt-2 break-all font-mono text-xs text-gray-400">
              {lab.target_url}
            </div>
          </div>
        )}

        {/* CHALLENGES */}

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">
          <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
            CHALLENGES
          </div>

          <h2 className="mt-2 text-xl font-semibold">
            Available challenges
          </h2>

          {challenges.length === 0 ? (
            <div className="mt-6 rounded-lg border border-yellow-400/10 bg-yellow-400/[0.03] p-5">
              <div className="font-mono text-xs text-yellow-400">
                NO CHALLENGES
              </div>

              <p className="mt-2 text-sm text-gray-600">
                This lab does not currently
                have any active challenges.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {challenges.map((challenge) => (
                <Link
                  key={challenge.id}
                  href={`/labs/${lab.id}/challenge/${challenge.id}`}
                  className="block rounded-xl border border-white/[0.07] bg-black/10 p-5 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.03]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-emerald-400">
                        {String(
                          challenge.order_number
                        ).padStart(2, "0")}
                      </span>

                      <div>
                        <h3 className="text-sm font-medium text-gray-300">
                          {challenge.title}
                        </h3>

                        {challenge.description && (
                          <p className="mt-1 text-xs leading-5 text-gray-600">
                            {challenge.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="shrink-0 font-mono text-xs text-emerald-400">
                      +{challenge.points} XP
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* OBJECTIVES */}

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">
          <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
            LAB OBJECTIVES
          </div>

          <h2 className="mt-2 text-xl font-semibold">
            What you will learn
          </h2>

          <div className="mt-6 space-y-3">
            {[
              "Understand the fundamentals of this security topic",
              "Learn practical security concepts",
              "Analyze security-related information",
              "Apply defensive security techniques",
            ].map((objective, index) => (
              <div
                key={objective}
                className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <span className="font-mono text-xs text-emerald-400">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="text-sm text-gray-400">
                  {objective}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* START */}

        <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                READY?
              </div>

              <h2 className="mt-2 text-lg font-semibold">
                Start {lab.title}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {firstActiveChallenge
                  ? `Begin "${firstActiveChallenge.title}" and start earning XP.`
                  : "No active challenge is available yet."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartLab}
              disabled={
                starting ||
                !firstActiveChallenge
              }
              className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-400 px-6 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
            >
              {starting
                ? "STARTING..."
                : firstActiveChallenge
                  ? "START LAB →"
                  : "NO CHALLENGES"}
            </button>
          </div>
        </div>

        {/* BACK */}

        <div className="mt-6">
          <Link
            href="/labs"
            className="font-mono text-[10px] text-gray-600 transition hover:text-emerald-400"
          >
            ← BACK TO ALL LABS
          </Link>
        </div>
      </section>
    </main>
  );
}

// ================================================================
// INFO CARD
// ================================================================

function InfoCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0a1019] p-5">
      <div className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
        {label}
      </div>

      <div
        className={`mt-2 font-mono text-sm ${
          accent
            ? "text-emerald-400"
            : "text-gray-300"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
