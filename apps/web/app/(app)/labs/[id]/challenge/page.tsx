
"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
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

type LabResponse = {
  success: boolean;
  lab?: Lab;
};

type ChallengesResponse = {
  success: boolean;
  lab_id: number;
  challenges: Challenge[];
};

export default function ChallengePage() {
  const params = useParams();

  const rawId = params?.id;

  const labId = Number(
    Array.isArray(rawId) ? rawId[0] : rawId
  );

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api/v1";

  const [lab, setLab] = useState<Lab | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [completed, setCompleted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  /*
  |--------------------------------------------------------------------------
  | FETCH LAB + CHALLENGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!labId || Number.isNaN(labId)) {
      return;
    }

    const loadLab = async () => {
      try {
        setLoading(true);
        setMessage("");
        setMessageType("");

        /*
         * Fetch lab
         */
        const labResponse = await fetch(
          `${API_URL}/labs/${labId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (!labResponse.ok) {
          throw new Error(
            `Failed to fetch lab: ${labResponse.status}`
          );
        }

        const labData: LabResponse =
          await labResponse.json();

        if (!labData.success || !labData.lab) {
          throw new Error("Lab not found.");
        }

        setLab(labData.lab);

        /*
         * Fetch challenges belonging to this lab
         */
        const challengesResponse = await fetch(
          `${API_URL}/labs/${labId}/challenges`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (!challengesResponse.ok) {
          throw new Error(
            `Failed to fetch challenges: ${challengesResponse.status}`
          );
        }

        const challengesData: ChallengesResponse =
          await challengesResponse.json();

        if (
          !challengesData.success ||
          !Array.isArray(challengesData.challenges)
        ) {
          throw new Error(
            "Invalid challenges response."
          );
        }

        setChallenges(challengesData.challenges);

        /*
         * Select the first active challenge.
         */
        const firstChallenge =
          challengesData.challenges.find(
            (item) =>
              item.is_active === 1 ||
              item.is_active === true
          );

        setChallenge(firstChallenge || null);

        /*
         * Restore local progress for this challenge.
         */
        if (firstChallenge) {
          const saved = localStorage.getItem(
            `cyberlab-challenge-${firstChallenge.id}`
          );

          if (saved === "completed") {
            setCompleted(true);
            setSubmitted(true);
            setMessage(
              "Challenge already completed."
            );
            setMessageType("success");
          }
        }
      } catch (error) {
        console.error(
          "Failed to load lab:",
          error
        );

        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load lab."
        );

        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    loadLab();
  }, [labId, API_URL]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d] text-white">
        <div className="text-center">
          <div className="font-mono text-sm text-emerald-400">
            LOADING LAB...
          </div>

          <div className="mt-3 font-mono text-xs text-gray-600">
            Fetching challenge data from server
          </div>
        </div>
    </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | INVALID LAB
  |--------------------------------------------------------------------------
  */

  if (!lab) {
    notFound();
  }

  /*
  |--------------------------------------------------------------------------
  | NO CHALLENGES
  |--------------------------------------------------------------------------
  */

  if (!challenge) {
    return (
    <div className="w-full h-full">
      <section className="mx-auto max-w-[1000px] px-5 py-20 text-center">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-10">
            <div className="font-mono text-xs text-yellow-400">
              NO CHALLENGES
            </div>

            <h1 className="mt-4 text-2xl font-bold">
              No challenges available
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500">
              This lab does not currently have any
              active challenges.
            </p>

            <Link
              href={`/labs/${lab.id}`}
              className="mt-8 inline-flex h-11 items-center rounded-lg border border-emerald-400/30 px-6 font-mono text-xs text-emerald-400 transition hover:bg-emerald-400/10"
            >
              ← RETURN TO LAB
            </Link>
          </div>
        </section>
    </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DIFFICULTY
  |--------------------------------------------------------------------------
  */

  const difficultyColor =
    lab.difficulty === "EASY"
      ? "text-emerald-400"
      : lab.difficulty === "MEDIUM"
        ? "text-yellow-400"
        : "text-red-400";

  /*
  |--------------------------------------------------------------------------
  | PROGRESS
  |--------------------------------------------------------------------------
  */

  const completedCount = completed
    ? 1
    : 0;

  const progress =
    challenges.length > 0
      ? Math.round(
          (completedCount / challenges.length) *
            100
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | Your current challenges table does NOT contain
  | an answer column.
  |
  | Therefore this frontend cannot securely validate
  | the answer against the database yet.
  |
  | For now this only validates that an answer was
  | entered. Real validation should be done through
  | a backend submission endpoint.
  |
  */

  const handleSubmit = async () => {
    if (completed || submitting) {
      return;
    }

    const cleanAnswer = answer.trim();

    if (!cleanAnswer) {
      setMessage(
        "Please enter an answer before submitting."
      );
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      /*
       * TEMPORARY:
       * Since there is currently no answer column
       * or submission endpoint, we cannot determine
       * whether the answer is correct.
       *
       * Do NOT mark the challenge as completed here
       * in a production system.
       */

      setMessage(
        "Answer received. Backend answer validation is required before this challenge can be marked complete."
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "Challenge submission failed:",
        error
      );

      setMessage(
        "Failed to submit your answer."
      );

      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  const handleReset = () => {
    setAnswer("");
    setSubmitted(false);
    setMessage("");
    setMessageType("");
    setShowHint(false);
  };

  /*
  |--------------------------------------------------------------------------
  | KEYBOARD
  |--------------------------------------------------------------------------
  */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#05080d] text-white">

      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}

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
            href={`/labs/${lab.id}`}
            className="font-mono text-xs text-gray-500 transition hover:text-emerald-400"
          >
            ← LAB OVERVIEW
          </Link>

        </div>
      </header>

      {/* ================================================================ */}
      {/* CONTENT */}
      {/* ================================================================ */}

      <section className="mx-auto max-w-[1200px] px-5 py-10 lg:px-8">

        {/* Breadcrumb */}

        <div className="mb-8 font-mono text-[9px] tracking-[0.15em] text-gray-600">
          CYBERLAB / LABS /{" "}
          {lab.category.toUpperCase()} / CHALLENGE
        </div>

        {/* ============================================================ */}
        {/* LAB HEADER */}
        {/* ============================================================ */}

        <div className="rounded-2xl border border-emerald-400/20 bg-[#0a1019] p-6 sm:p-8">

          <div className="flex flex-col justify-between gap-6 md:flex-row">

            <div>

              <div className="mb-3 font-mono text-[9px] tracking-wider text-emerald-400">
                {lab.category.toUpperCase()}
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
                className={`font-mono text-xs ${difficultyColor}`}
              >
                {lab.difficulty}
              </div>

              <div className="mt-2 font-mono text-xs text-gray-500">
                +{challenge.points} XP
              </div>

            </div>

          </div>

        </div>

        {/* ============================================================ */}
        {/* MAIN GRID */}
        {/* ============================================================ */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* ========================================================== */}
          {/* MAIN CHALLENGE */}
          {/* ========================================================== */}

          <div className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">

            {/* Challenge number */}

            <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
              CHALLENGE{" "}
              {String(
                challenge.order_number
              ).padStart(2, "0")}
            </div>

            {/* Title */}

            <h2 className="mt-3 text-2xl font-semibold">
              {challenge.title}
            </h2>

            {/* Description */}

            {challenge.description && (
              <p className="mt-4 text-sm leading-7 text-gray-500">
                {challenge.description}
              </p>
            )}

            {/* ======================================================== */}
            {/* TASK */}
            {/* ======================================================== */}

            <div className="mt-8 rounded-xl border border-white/[0.07] bg-black/20 p-5">

              <div className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
                TASK
              </div>

              <p className="mt-3 text-sm leading-7 text-gray-300">
                {challenge.task}
              </p>

            </div>

            {/* ======================================================== */}
            {/* TERMINAL */}
            {/* ======================================================== */}

            <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-black">

              <div className="flex h-10 items-center justify-between border-b border-white/[0.07] px-4">

                <span className="font-mono text-[9px] text-gray-600">
                  TERMINAL
                </span>

                <span className="font-mono text-[9px] text-gray-700">
                  {lab.target_type}
                </span>

              </div>

              <div className="min-h-[260px] p-5 font-mono text-sm">

                <div className="text-gray-500">
                  cyberlab@{lab.category.toLowerCase()}:~$
                </div>

                {answer && (
                  <div className="mt-3 break-all text-gray-300">
                    {answer}
                  </div>
                )}

                {completed && (
                  <div className="w-full h-full">
                    <div className="mt-4 text-emerald-400">
                      ✓ Challenge completed
                    </div>

                    <div className="mt-2 text-gray-500">
                      +{challenge.points} XP awarded
                    </div>
                  </div>
                )}

                {!answer && (
                  <div className="mt-3 animate-pulse text-emerald-400">
                    _
                  </div>
                )}

              </div>

            </div>

            {/* ======================================================== */}
            {/* ANSWER */}
            {/* ======================================================== */}

            <div className="mt-6">

              <label
                htmlFor="challenge-answer"
                className="font-mono text-[9px] tracking-[0.15em] text-gray-600"
              >
                SUBMIT ANSWER
              </label>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">

                <input
                  id="challenge-answer"
                  type="text"
                  value={answer}
                  disabled={completed || submitting}
                  onChange={(event) => {
                    setAnswer(
                      event.target.value
                    );

                    if (
                      messageType === "error"
                    ) {
                      setMessage("");
                      setMessageType("");
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your answer..."
                  className="h-11 flex-1 rounded-lg border border-white/[0.08] bg-black/30 px-4 font-mono text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    completed ||
                    submitting
                  }
                  className="h-11 rounded-lg bg-emerald-400 px-6 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                >
                  {submitting
                    ? "SUBMITTING..."
                    : completed
                      ? "COMPLETED ✓"
                      : "SUBMIT →"}
                </button>

              </div>

              {/* ====================================================== */}
              {/* MESSAGE */}
              {/* ====================================================== */}

              {message && (
                <div
                  className={`mt-4 rounded-lg border px-4 py-3 font-mono text-xs ${
                    messageType ===
                    "success"
                      ? "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-400"
                      : "border-red-400/20 bg-red-400/[0.05] text-red-400"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Reset */}

              {!completed &&
                submitted && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 font-mono text-[10px] text-gray-600 transition hover:text-gray-300"
                  >
                    CLEAR ANSWER
                  </button>
                )}

            </div>

            {/* ======================================================== */}
            {/* SUCCESS */}
            {/* ======================================================== */}

            {completed && (
              <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">

                <div className="font-mono text-[9px] tracking-[0.15em] text-emerald-400">
                  CHALLENGE COMPLETE
                </div>

                <h3 className="mt-2 text-lg font-semibold">
                  Excellent work.
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  You successfully completed
                  this challenge and earned{" "}
                  <span className="text-emerald-400">
                    {challenge.points} XP
                  </span>
                  .
                </p>

                <Link
                  href={`/labs/${lab.id}`}
                  className="mt-5 inline-flex h-10 items-center rounded-lg border border-emerald-400/30 px-5 font-mono text-[10px] text-emerald-400 transition hover:bg-emerald-400/10"
                >
                  ← RETURN TO LAB
                </Link>

              </div>
            )}

          </div>

          {/* ========================================================== */}
          {/* SIDEBAR */}
          {/* ========================================================== */}

          <aside className="space-y-6">

            {/* ======================================================== */}
            {/* PROGRESS */}
            {/* ======================================================== */}

            <div className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6">

              <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
                LAB PROGRESS
              </div>

              <div className="mt-4 flex items-end justify-between">

                <span className="text-2xl font-bold">
                  {progress}%
                </span>

                <span className="font-mono text-[10px] text-gray-600">
                  {completedCount} /{" "}
                  {challenges.length}
                </span>

              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

              {completed && (
                <div className="mt-4 font-mono text-[10px] text-emerald-400">
                  ✓ LAB COMPLETED
                </div>
              )}

            </div>

            {/* ======================================================== */}
            {/* CHALLENGE LIST */}
            {/* ======================================================== */}

            <div className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6">

              <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
                CHALLENGES
              </div>

              <div className="mt-5 space-y-3">

                {challenges.map(
                  (item) => (
                    <div
                      key={item.id}
                      className={`rounded-lg border p-3 ${
                        item.id ===
                        challenge.id
                          ? "border-emerald-400/20 bg-emerald-400/[0.04]"
                          : "border-white/[0.05] bg-black/10"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        <span className="font-mono text-[10px] text-emerald-400">
                          {String(
                            item.order_number
                          ).padStart(2, "0")}
                        </span>

                        <span className="text-xs text-gray-400">
                          {item.title}
                        </span>

                      </div>

                      <div className="mt-2 font-mono text-[9px] text-gray-700">
                        +{item.points} XP
                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* ======================================================== */}
            {/* HINT */}
            {/* ======================================================== */}

            <div className="rounded-2xl border border-yellow-400/10 bg-yellow-400/[0.03] p-6">

              <div className="font-mono text-[9px] tracking-[0.2em] text-yellow-400">
                NEED HELP?
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Hints will be available once
                the backend hint system is
                connected.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowHint(
                    (value) => !value
                  )
                }
                className="mt-4 font-mono text-[10px] text-yellow-400 transition hover:text-yellow-300"
              >
                {showHint
                  ? "HIDE →"
                  : "SHOW →"}
              </button>

              {showHint && (
                <div className="mt-4 rounded-lg border border-yellow-400/10 bg-black/20 p-4">

                  <p className="font-mono text-xs leading-6 text-yellow-300/70">
                    The hint system is
                    not yet connected to
                    the database.
                  </p>

                </div>
              )}

            </div>

            {/* ======================================================== */}
            {/* CHALLENGE INFO */}
            {/* ======================================================== */}

            <div className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6">

              <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
                CHALLENGE INFO
              </div>

              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between">

                  <span className="text-xs text-gray-600">
                    CATEGORY
                  </span>

                  <span className="font-mono text-xs text-gray-400">
                    {lab.category}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-xs text-gray-600">
                    DIFFICULTY
                  </span>

                  <span
                    className={`font-mono text-xs ${difficultyColor}`}
                  >
                    {lab.difficulty}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-xs text-gray-600">
                    REWARD
                  </span>

                  <span className="font-mono text-xs text-emerald-400">
                    +{challenge.points} XP
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-xs text-gray-600">
                    STATUS
                  </span>

                  <span
                    className={`font-mono text-xs ${
                      completed
                        ? "text-emerald-400"
                        : "text-gray-500"
                    }`}
                  >
                    {completed
                      ? "COMPLETED"
                      : "IN PROGRESS"}
                  </span>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </section>
    </div>
  );
}
