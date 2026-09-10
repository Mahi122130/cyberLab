
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Lab = {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  target_type: "WEB" | "LINUX" | "NETWORK" | "CRYPTO";
  target_url?: string | null;
  docker_image?: string | null;
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

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();

  const rawLabId = params?.id;
  const rawChallengeId = params?.challengeId;

  const labId = Number(
    Array.isArray(rawLabId)
      ? rawLabId[0]
      : rawLabId
  );

  const challengeId = Number(
    Array.isArray(rawChallengeId)
      ? rawChallengeId[0]
      : rawChallengeId
  );

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5001/api/v1";

  const [lab, setLab] = useState<Lab | null>(null);
  const [challenge, setChallenge] =
    useState<Challenge | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================================================
  // LOAD LAB + CHALLENGE
  // ================================================================

  useEffect(() => {
    if (
      !labId ||
      Number.isNaN(labId) ||
      !challengeId ||
      Number.isNaN(challengeId)
    ) {
      setError("Invalid lab or challenge ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadChallenge = async () => {
      try {
        setLoading(true);
        setError("");

        // ==========================================================
        // GET LAB
        // ==========================================================

        const labResponse = await fetch(
          `${API_URL}/labs/${labId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (!labResponse.ok) {
          throw new Error(
            `Failed to load lab (${labResponse.status})`
          );
        }

        // IMPORTANT:
        // Backend returns the lab directly.
        const labData: Lab =
          await labResponse.json();

        console.log(
          "Challenge page - lab:",
          labData
        );

        if (
          !labData ||
          typeof labData.id !== "number"
        ) {
          throw new Error("Lab not found.");
        }

        // ==========================================================
        // GET CHALLENGE (single)
        // Use the dedicated endpoint to ensure the frontend
        // can load a challenge even if it's not returned
        // in the active challenges list.
        // ==========================================================

        const pluralEndpoint = `${API_URL}/labs/${labId}/challenges/${challengeId}`;
        const singularEndpoint = `${API_URL}/labs/${labId}/challenge/${challengeId}`;

        console.log('Attempting challenge endpoints:', {
          plural: pluralEndpoint,
          singular: singularEndpoint,
        });

        // Try plural first, then fallback to singular for environments
        // where the endpoint might be misconfigured.
        let challengeResponse = await fetch(pluralEndpoint, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!challengeResponse.ok) {
          // If plural 404, try singular as a fallback.
          if (challengeResponse.status === 404) {
            console.warn('Plural challenge endpoint returned 404, trying singular endpoint');

            try {
              challengeResponse = await fetch(singularEndpoint, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                cache: 'no-store',
              });
            } catch (e) {
              console.error('Singular challenge fetch exception:', e);
            }
          }
        }

        if (!challengeResponse.ok) {
          let bodyText = '';
          try {
            bodyText = await challengeResponse.text();
          } catch (e) {
            bodyText = `<failed to read body: ${String(e)}>`;
          }

          console.error(`Challenge fetch failed: ${challengeResponse.status}`, bodyText);
          throw new Error(`Failed to load challenge (${challengeResponse.status})`);
        }

        const challengeData = await challengeResponse.json();

        console.log('Challenge page - challenge:', challengeData);

        const foundChallenge =
          challengeData && challengeData.challenge
            ? challengeData.challenge
            : null;

        if (!foundChallenge) {
          throw new Error(
            "Challenge not found."
          );
        }

        if (
          foundChallenge.lab_id !== labId
        ) {
          throw new Error(
            "Challenge does not belong to this lab."
          );
        }

        if (
          !(
            foundChallenge.is_active === true ||
            foundChallenge.is_active === 1 ||
            String(
              foundChallenge.is_active
            ) === "1" ||
            String(
              foundChallenge.is_active
            ).toLowerCase() === "true"
          )
        ) {
          throw new Error(
            "This challenge is currently inactive."
          );
        }

        if (cancelled) {
          return;
        }

        setLab(labData);
        setChallenge(foundChallenge);
      } catch (err) {
        console.error(
          "Failed to load challenge:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load challenge."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadChallenge();

    return () => {
      cancelled = true;
    };
  }, [labId, challengeId, API_URL]);

  // ================================================================
  // LOADING
  // ================================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05080d] text-white">
        <div className="text-center">
          <div className="font-mono text-sm text-emerald-400">
            LOADING CHALLENGE...
          </div>

          <div className="mt-3 font-mono text-xs text-gray-600">
            Preparing your security challenge
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

  if (error || !lab || !challenge) {
    return (
      <main className="min-h-screen bg-[#05080d] text-white">
        <header className="border-b border-white/[0.07]">
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

        <section className="mx-auto max-w-[800px] px-5 py-20">
          <div className="rounded-2xl border border-red-400/20 bg-[#0a1019] p-10 text-center">
            <div className="font-mono text-xs tracking-wider text-red-400">
              CHALLENGE ERROR
            </div>

            <h1 className="mt-4 text-2xl font-bold">
              Unable to load challenge
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-500">
              {error ||
                "Challenge not found."}
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="inline-flex h-11 items-center rounded-lg bg-emerald-400 px-6 font-mono text-xs font-semibold text-black hover:bg-emerald-300"
              >
                TRY AGAIN
              </button>

              <Link
                href={`/labs/${labId}`}
                className="inline-flex h-11 items-center rounded-lg border border-white/[0.08] px-6 font-mono text-xs text-gray-400 hover:border-emerald-400/30 hover:text-emerald-400"
              >
                ← BACK TO LAB
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ================================================================
  // RENDER
  // ================================================================

  const difficultyClass =
    lab.difficulty === "EASY"
      ? "text-emerald-400"
      : lab.difficulty === "MEDIUM"
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      {/* HEADER */}

      <header className="border-b border-white/[0.07]">
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
            href={`/labs/${lab.id}`}
            className="font-mono text-xs text-gray-500 transition hover:text-emerald-400"
          >
            ← BACK TO LAB
          </Link>
        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-[1100px] px-5 py-10 lg:px-8">
        {/* BREADCRUMB */}

        <div className="mb-8 font-mono text-[9px] tracking-[0.15em] text-gray-600">
          CYBERLAB / LABS /{" "}
          {lab.category?.toUpperCase()} / CHALLENGE
        </div>

        {/* CHALLENGE HEADER */}

        <div className="rounded-2xl border border-emerald-400/20 bg-[#0a1019] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div>
              <div className="mb-3 font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                CHALLENGE{" "}
                {String(
                  challenge.order_number
                ).padStart(2, "0")}
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                {challenge.title}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-500">
                {challenge.description}
              </p>
            </div>

            <div className="shrink-0">
              <div
                className={`font-mono text-xs ${difficultyClass}`}
              >
                {lab.difficulty}
              </div>

              <div className="mt-2 font-mono text-xs text-emerald-400">
                +{challenge.points} XP
              </div>
            </div>
          </div>
        </div>

        {/* TASK */}

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">
          <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
            MISSION
          </div>

          <h2 className="mt-2 text-xl font-semibold">
            Your task
          </h2>

          <div className="mt-6 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-6">
            <p className="text-sm leading-7 text-gray-300">
              {challenge.task}
            </p>
          </div>
        </div>

        {/* TARGET */}

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">
          <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
            TARGET
          </div>

          <h2 className="mt-2 text-xl font-semibold">
            Challenge environment
          </h2>

          {lab.target_url ? (
            <div className="mt-6">
              <div className="font-mono text-[9px] text-gray-600">
                TARGET URL
              </div>

              <a
                href={lab.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all rounded-lg border border-white/[0.07] bg-black/20 p-4 font-mono text-sm text-emerald-400 transition hover:border-emerald-400/30"
              >
                {lab.target_url}
              </a>

              <p className="mt-3 text-xs text-gray-600">
                Opens the challenge target in a
                new tab.
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-yellow-400/10 bg-yellow-400/[0.03] p-5">
              <div className="font-mono text-xs text-yellow-400">
                TARGET NOT CONFIGURED
              </div>

              <p className="mt-2 text-sm text-gray-600">
                The administrator has not configured
                a target URL for this lab yet.
              </p>
            </div>
          )}
        </div>

        {/* CHALLENGE INFORMATION */}

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <InfoCard
            label="LAB"
            value={lab.title}
          />

          <InfoCard
            label="TYPE"
            value={lab.target_type}
          />

          <InfoCard
            label="REWARD"
            value={`+${challenge.points} XP`}
            accent
          />
        </div>

        {/* INSTRUCTIONS */}

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">
          <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
            WORKFLOW
          </div>

          <h2 className="mt-2 text-xl font-semibold">
            How to approach the challenge
          </h2>

          <div className="mt-6 space-y-3">
            {[
              "Read the challenge description carefully.",
              "Inspect the target application.",
              "Identify the security weakness.",
              "Exploit the vulnerability in the authorized lab environment.",
              "Submit the flag when you find it.",
            ].map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <span className="font-mono text-xs text-emerald-400">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="text-sm text-gray-400">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* NAVIGATION */}

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <Link
            href={`/labs/${lab.id}`}
            className="inline-flex h-11 items-center rounded-lg border border-white/[0.08] px-6 font-mono text-xs text-gray-400 transition hover:border-emerald-400/30 hover:text-emerald-400"
          >
            ← BACK TO LAB
          </Link>

          {lab.target_url && (
            <a
              href={lab.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-lg bg-emerald-400 px-6 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300"
            >
              OPEN TARGET →
            </a>
          )}
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
