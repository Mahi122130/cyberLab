"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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

type ChallengeHint = {
  id: number;
  hint_text: string;
  hint_order: number;
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
  hints?: ChallengeHint[];
};

export default function ChallengePage() {
  const params = useParams();

  const rawLabId = params?.id;
  const rawChallengeId = params?.challengeId;

  const labId = Number(
    Array.isArray(rawLabId) ? rawLabId[0] : rawLabId
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

  const [revealedHints, setRevealedHints] = useState(0);
  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] =
    useState("");
  const [submissionCorrect, setSubmissionCorrect] =
    useState(false);
  const [earnedPoints, setEarnedPoints] =
    useState<number | null>(null);

  // ================================================================
  // FIND AUTH TOKEN
  // ================================================================

  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const possibleKeys = [
      "cyberlab_token",
      "accessToken",
      "access_token",
      "token",
      "jwt",
      "authToken",
      "auth_token",
      "cyberlab_access_token",
      "cyberlab_accessToken",
    ];

    // --------------------------------------------------------------
    // 1. Check localStorage using common token names
    // --------------------------------------------------------------

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);

      if (value) {
        const cleaned = value.trim();

        if (cleaned) {
          return cleaned.startsWith("Bearer ")
            ? cleaned.substring(7).trim()
            : cleaned;
        }
      }
    }

    // --------------------------------------------------------------
    // 2. Check sessionStorage using common token names
    // --------------------------------------------------------------

    for (const key of possibleKeys) {
      const value = sessionStorage.getItem(key);

      if (value) {
        const cleaned = value.trim();

        if (cleaned) {
          return cleaned.startsWith("Bearer ")
            ? cleaned.substring(7).trim()
            : cleaned;
        }
      }
    }

    // --------------------------------------------------------------
    // 3. Check cyberlab_user
    // --------------------------------------------------------------

    const storedUser =
      localStorage.getItem("cyberlab_user");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);

        const possibleUserTokenKeys = [
          "token",
          "accessToken",
          "access_token",
          "jwt",
          "authToken",
          "auth_token",
        ];

        for (const key of possibleUserTokenKeys) {
          const value = parsed?.[key];

          if (
            typeof value === "string" &&
            value.trim()
          ) {
            const cleaned = value.trim();

            return cleaned.startsWith("Bearer ")
              ? cleaned.substring(7).trim()
              : cleaned;
          }
        }
      } catch {
        // Ignore invalid JSON.
      }
    }

    // --------------------------------------------------------------
    // 4. Last fallback:
    // Search localStorage for a JWT-looking value.
    // A JWT normally has three dot-separated sections.
    // --------------------------------------------------------------

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (!key) {
          continue;
        }

        const value = localStorage.getItem(key);

        if (!value) {
          continue;
        }

        const cleaned = value.trim();

        if (
          cleaned.startsWith("eyJ") &&
          cleaned.split(".").length === 3
        ) {
          return cleaned;
        }

        // Sometimes the token is inside a JSON object.
        try {
          const parsed = JSON.parse(cleaned);

          if (
            parsed &&
            typeof parsed === "object"
          ) {
            for (const tokenKey of [
              "token",
              "accessToken",
              "access_token",
              "jwt",
              "authToken",
              "auth_token",
            ]) {
              const nestedToken =
                parsed?.[tokenKey];

              if (
                typeof nestedToken === "string" &&
                nestedToken.trim()
              ) {
                const token =
                  nestedToken.trim();

                if (
                  token.startsWith("eyJ") &&
                  token.split(".").length === 3
                ) {
                  return token;
                }
              }
            }
          }
        } catch {
          // Not JSON. Continue searching.
        }
      }
    } catch {
      // Ignore storage access errors.
    }

    return null;
  };

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
        // GET CHALLENGE
        // ==========================================================

        const pluralEndpoint =
          `${API_URL}/labs/${labId}/challenges/${challengeId}`;

        const singularEndpoint =
          `${API_URL}/labs/${labId}/challenge/${challengeId}`;

        console.log(
          "Attempting challenge endpoints:",
          {
            plural: pluralEndpoint,
            singular: singularEndpoint,
          }
        );

        let challengeResponse =
          await fetch(pluralEndpoint, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          });

        if (!challengeResponse.ok) {
          if (challengeResponse.status === 404) {
            console.warn(
              "Plural challenge endpoint returned 404, trying singular endpoint"
            );

            try {
              challengeResponse =
                await fetch(
                  singularEndpoint,
                  {
                    method: "GET",
                    headers: {
                      Accept: "application/json",
                    },
                    cache: "no-store",
                  }
                );
            } catch (e) {
              console.error(
                "Singular challenge fetch exception:",
                e
              );
            }
          }
        }

        if (!challengeResponse.ok) {
          let bodyText = "";

          try {
            bodyText =
              await challengeResponse.text();
          } catch (e) {
            bodyText =
              `<failed to read body: ${String(e)}>`;
          }

          console.error(
            `Challenge fetch failed: ${challengeResponse.status}`,
            bodyText
          );

          throw new Error(
            `Failed to load challenge (${challengeResponse.status})`
          );
        }

        const challengeData =
          await challengeResponse.json();

        console.log(
          "Challenge page - challenge:",
          challengeData
        );

        const foundChallenge =
          challengeData &&
          challengeData.challenge
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

        const isActive =
          foundChallenge.is_active === true ||
          foundChallenge.is_active === 1 ||
          String(
            foundChallenge.is_active
          ) === "1" ||
          String(
            foundChallenge.is_active
          ).toLowerCase() === "true";

        if (!isActive) {
          throw new Error(
            "This challenge is currently inactive."
          );
        }

        if (cancelled) {
          return;
        }

        setLab(labData);
        setChallenge(foundChallenge);

        setRevealedHints(0);
        setFlag("");
        setSubmitting(false);
        setSubmissionMessage("");
        setSubmissionCorrect(false);
        setEarnedPoints(null);
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
  // HINTS
  // ================================================================

  const revealNextHint = () => {
    const hintCount =
      challenge?.hints?.length ?? 0;

    if (hintCount === 0) {
      return;
    }

    setRevealedHints((current) =>
      Math.min(
        current + 1,
        hintCount
      )
    );
  };

  // ================================================================
  // SUBMIT FLAG
  // ================================================================

  const submitFlag = async () => {
    if (
      !challenge ||
      !flag.trim() ||
      submitting ||
      submissionCorrect
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionMessage("");

      // ------------------------------------------------------------
      // GET USER
      // ------------------------------------------------------------

      const storedUser =
        localStorage.getItem(
          "cyberlab_user"
        );

      if (!storedUser) {
        setSubmissionMessage(
          "You must be logged in to submit a flag."
        );
        return;
      }

      let user: {
        id?: number | string;
        token?: string;
        accessToken?: string;
        access_token?: string;
      };

      try {
        user = JSON.parse(
          storedUser
        );
      } catch {
        setSubmissionMessage(
          "Your login session is invalid. Please log in again."
        );
        return;
      }

      const userId = Number(user.id);

      if (
        !user.id ||
        Number.isNaN(userId) ||
        userId <= 0
      ) {
        setSubmissionMessage(
          "Unable to identify your account. Please log in again."
        );
        return;
      }

      // ------------------------------------------------------------
      // GET JWT
      // ------------------------------------------------------------

      const token =
        getAuthToken();

      if (!token) {
        console.error(
          "No authentication token found in localStorage/sessionStorage."
        );

        setSubmissionMessage(
          "Your login token is missing. Please log out and log in again."
        );

        return;
      }

      console.log(
        "Submitting authenticated flag request:",
        {
          userId,
          challengeId: challenge.id,
          hasToken: true,
        }
      );

      // ------------------------------------------------------------
      // SUBMIT FLAG
      // ------------------------------------------------------------

      const response =
        await fetch(
          `${API_URL}/submissions`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            credentials: "include",

            body: JSON.stringify({
              userId,
              challengeId:
                challenge.id,
              flag:
                flag.trim(),
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      console.log(
        "Submission response:",
        {
          status:
            response.status,
          ok:
            response.ok,
          data,
        }
      );

      // ------------------------------------------------------------
      // UNAUTHORIZED
      // ------------------------------------------------------------

      if (response.status === 401) {
        setSubmissionMessage(
          "Your login session has expired or is invalid. Please log out and log in again."
        );

        return;
      }

      // ------------------------------------------------------------
      // OTHER API ERROR
      // ------------------------------------------------------------

      if (!response.ok) {
        const message =
          Array.isArray(
            data?.message
          )
            ? data.message.join(
                ", "
              )
            : data?.message;

        throw new Error(
          message ||
            `Submission failed (${response.status})`
        );
      }

      // ------------------------------------------------------------
      // CHECK RESULT
      // ------------------------------------------------------------

      const correct =
        data?.correct === true ||
        data?.success === true;

      if (correct) {
        setSubmissionCorrect(
          true
        );

        setEarnedPoints(
          Number(
            data?.points ??
              challenge.points
          )
        );

        setSubmissionMessage(
          data?.message ||
            "Correct flag! Challenge completed."
        );
      } else {
        setSubmissionCorrect(
          false
        );

        setEarnedPoints(null);

        setSubmissionMessage(
          data?.message ||
            "Incorrect flag. Try again."
        );
      }
    } catch (err) {
      console.error(
        "Flag submission failed:",
        err
      );

      setSubmissionCorrect(
        false
      );

      setEarnedPoints(null);

      setSubmissionMessage(
        err instanceof Error
          ? err.message
          : "Unable to submit the flag."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ================================================================
  // LOADING
  // ================================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d] text-white">
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
      </div>
    );
  }

  // ================================================================
  // ERROR
  // ================================================================

  if (
    error ||
    !lab ||
    !challenge
  ) {
    return (
      <div className="w-full h-full">
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
      </div>
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
    <div className="min-h-screen bg-[#05080d] text-white">
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

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="mt-2 text-xl font-semibold">
                Challenge environment
              </h2>

              <p className="mt-2 text-xs leading-6 text-gray-600">
                This target runs separately in an isolated Docker
                environment, while your CyberLab challenge stays open.
              </p>
            </div>

            {lab.target_url && (
              <span className="shrink-0 rounded-lg border border-emerald-400/20 px-3 py-2 font-mono text-[9px] text-emerald-400">
                DOCKER TARGET
              </span>
            )}
          </div>

          {lab.target_url ? (
            <div className="mt-6">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-mono text-[9px] text-gray-600">
                  RUNNING AT
                </div>

                <div className="break-all font-mono text-[10px] text-emerald-400">
                  {lab.target_url}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black">
                <div className="flex h-10 items-center gap-2 border-b border-white/[0.07] bg-[#070b12] px-4">
                  <span className="h-2 w-2 rounded-full bg-red-400/70" />
                  <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/70" />

                  <span className="ml-3 truncate font-mono text-[9px] text-gray-600">
                    {lab.target_url}
                  </span>
                </div>

                <div className="h-[650px] bg-white">
                  <iframe
                    src={lab.target_url}
                    title={`${challenge.title} target environment`}
                    className="h-full w-full border-0"
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
              </div>

              <p className="mt-3 text-xs leading-6 text-gray-600">
                Work with the target above. You do not need to leave
                CyberLab to complete the challenge.
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

        {/* HINTS */}

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">
          <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
            HINTS
          </div>

          <h2 className="mt-2 text-xl font-semibold">
            Need a little help?
          </h2>

          {challenge.hints &&
          challenge.hints.length > 0 ? (
            <div className="mt-6 space-y-3">
              {challenge.hints.map(
                (hint, index) => {
                  const isRevealed =
                    index <
                    revealedHints;

                  const isNext =
                    index ===
                    revealedHints;

                  return (
                    <div
                      key={hint.id}
                      className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-[10px] text-gray-500">
                          HINT{" "}
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        {!isRevealed &&
                          isNext && (
                            <button
                              type="button"
                              onClick={
                                revealNextHint
                              }
                              className="rounded-lg border border-yellow-400/20 px-3 py-2 font-mono text-[10px] text-yellow-400 transition hover:bg-yellow-400/10"
                            >
                              REVEAL HINT
                            </button>
                          )}
                      </div>

                      {isRevealed ? (
                        <p className="mt-3 text-sm leading-7 text-gray-400">
                          {hint.hint_text}
                        </p>
                      ) : (
                        <p className="mt-3 text-xs text-gray-700">
                          Hint locked.
                        </p>
                      )}
                    </div>
                  );
                }
              )}

              {revealedHints <
                challenge.hints.length && (
                <p className="pt-1 font-mono text-[9px] text-gray-700">
                  {challenge.hints.length -
                    revealedHints}{" "}
                  hint
                  {challenge.hints.length -
                    revealedHints ===
                  1
                    ? ""
                    : "s"}{" "}
                  remaining
                </p>
              )}
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-600">
              No hints have been added for this
              challenge.
            </p>
          )}
        </div>

        {/* SUBMIT FLAG */}

        <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-[#0a1019] p-6 sm:p-8">
          <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
            SUBMISSION
          </div>

          <h2 className="mt-2 text-xl font-semibold">
            Submit your flag
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Enter the flag you discovered in the
            authorized challenge environment.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={flag}
              onChange={(event) => {
                setFlag(
                  event.target.value
                );

                if (
                  !submissionCorrect
                ) {
                  setSubmissionMessage(
                    ""
                  );
                }
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  submitFlag();
                }
              }}
              disabled={
                submitting ||
                submissionCorrect
              }
              placeholder="CYBERLAB{...}"
              autoComplete="off"
              spellCheck={false}
              className="h-12 min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-black/20 px-4 font-mono text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="button"
              onClick={
                submitFlag
              }
              disabled={
                !flag.trim() ||
                submitting ||
                submissionCorrect
              }
              className="h-12 rounded-lg bg-emerald-400 px-6 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting
                ? "CHECKING..."
                : submissionCorrect
                  ? "COMPLETED ✓"
                  : "SUBMIT FLAG"}
            </button>
          </div>

          {submissionMessage && (
            <div
              className={`mt-4 rounded-lg border p-4 ${
                submissionCorrect
                  ? "border-emerald-400/20 bg-emerald-400/[0.05]"
                  : "border-red-400/20 bg-red-400/[0.05]"
              }`}
            >
              <div
                className={`font-mono text-xs ${
                  submissionCorrect
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {submissionMessage}
              </div>

              {submissionCorrect &&
                earnedPoints !==
                  null && (
                  <div className="mt-2 font-mono text-xs font-semibold text-emerald-400">
                    +{earnedPoints} XP EARNED
                  </div>
                )}
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
            ].map(
              (item, index) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <span className="font-mono text-xs text-emerald-400">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <span className="text-sm text-gray-400">
                    {item}
                  </span>
                </div>
              )
            )}
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
            <span className="inline-flex h-11 items-center rounded-lg border border-emerald-400/20 px-6 font-mono text-xs text-emerald-400">
              TARGET RUNNING ABOVE
            </span>
          )}
        </div>
      </section>
    </div>
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