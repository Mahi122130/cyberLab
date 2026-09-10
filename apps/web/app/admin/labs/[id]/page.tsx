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
  target_url: string | null;
  docker_image: string | null;
  is_active: number | boolean;
  created_at: string;
};

type Challenge = {
  id: number;
  lab_id: number;
  title: string;
  slug: string;
  description: string | null;
  points: number;
  order_number: number;
  is_active: number | boolean;
  created_at: string;
};

/*
|--------------------------------------------------------------------------
| API CONFIGURATION
|--------------------------------------------------------------------------
|
| .env.local:
|
| NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
|
| Therefore:
|
| API_URL/labs
| API_URL/labs/1
| API_URL/labs/1/challenges
|
*/

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5001/api/v1";

export default function AdminLabDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;

  const id = Array.isArray(rawId)
    ? rawId[0]
    : rawId;

  const [lab, setLab] = useState<Lab | null>(null);

  const [challenges, setChallenges] =
    useState<Challenge[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingChallenges, setLoadingChallenges] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [challengeError, setChallengeError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD LAB + CHALLENGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!id) {
      setError("Lab ID is missing.");
      setLoading(false);
      setLoadingChallenges(false);
      return;
    }

    let cancelled = false;

    async function loadLab() {
      try {
        setLoading(true);
        setError("");

        const labEndpoint =
          `${API_URL}/labs/${encodeURIComponent(String(id))}`;

        console.log(
          "Loading lab from:",
          labEndpoint,
        );

        const response = await fetch(
          labEndpoint,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        const text =
          await response.text();

        console.log(
          "Lab HTTP status:",
          response.status,
        );

        console.log(
          "Lab response:",
          text,
        );

        let data: any = null;

        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            throw new Error(
              "The API returned an invalid JSON response.",
            );
          }
        }

        if (!response.ok) {
          const serverMessage =
            Array.isArray(data?.message)
              ? data.message.join(", ")
              : data?.message;

          throw new Error(
            serverMessage ||
              `Failed to load lab. HTTP ${response.status}`,
          );
        }

        /*
         * Support:
         *
         * Direct:
         * { id: 1, title: "..." }
         *
         * { lab: {...} }
         *
         * { data: {...} }
         *
         * { data: { lab: {...} } }
         */

        const labData =
          data?.lab ??
          data?.data?.lab ??
          data?.data ??
          data;

        if (
          !labData ||
          typeof labData !== "object" ||
          !labData.id
        ) {
          throw new Error(
            "Lab was not found in the API response.",
          );
        }

        if (!cancelled) {
          setLab(labData as Lab);
        }
      } catch (err) {
        console.error(
          "Failed to load lab:",
          err,
        );

        if (!cancelled) {
          if (
            err instanceof TypeError &&
            err.message === "Failed to fetch"
          ) {
            setError(
              `Cannot connect to the CyberLab API at ${API_URL}. Make sure the NestJS backend is running.`,
            );
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to load lab.",
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    async function loadChallenges() {
      try {
        setLoadingChallenges(true);
        setChallengeError("");

        const challengesEndpoint =
          `${API_URL}/labs/${encodeURIComponent(
            String(id),
          )}/challenges`;

        console.log(
          "Loading challenges from:",
          challengesEndpoint,
        );

        const response = await fetch(
          challengesEndpoint,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        const text =
          await response.text();

        console.log(
          "Challenges HTTP status:",
          response.status,
        );

        console.log(
          "Challenges response:",
          text,
        );

        let data: any = null;

        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            throw new Error(
              "The API returned invalid JSON for challenges.",
            );
          }
        }

        if (!response.ok) {
          const serverMessage =
            Array.isArray(data?.message)
              ? data.message.join(", ")
              : data?.message;

          throw new Error(
            serverMessage ||
              `Failed to load challenges. HTTP ${response.status}`,
          );
        }

        /*
         * Support:
         *
         * [...]
         *
         * { challenges: [...] }
         *
         * { data: [...] }
         *
         * { data: { challenges: [...] } }
         */

        const challengeData =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.challenges)
              ? data.challenges
              : Array.isArray(data?.data?.challenges)
                ? data.data.challenges
                : Array.isArray(data?.data)
                  ? data.data
                  : [];

        const sorted =
          [...challengeData].sort(
            (a: Challenge, b: Challenge) =>
              Number(a.order_number || 0) -
              Number(b.order_number || 0),
          );

        if (!cancelled) {
          setChallenges(sorted);
        }
      } catch (err) {
        console.error(
          "Failed to load challenges:",
          err,
        );

        if (!cancelled) {
          setChallengeError(
            err instanceof Error
              ? err.message
              : "Failed to load challenges.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingChallenges(false);
        }
      }
    }

    loadLab();
    loadChallenges();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | DELETE LAB
  |--------------------------------------------------------------------------
  */

  async function handleDelete() {
    if (!lab || deleting) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${lab.title}"?\n\n` +
          `This will also delete all challenges belonging to this lab.\n\n` +
          `This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const endpoint =
        `${API_URL}/labs/${lab.id}`;

      console.log(
        "Deleting lab:",
        endpoint,
      );

      const response = await fetch(
        endpoint,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const text =
        await response.text();

      let data: any = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        const serverMessage =
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message;

        throw new Error(
          serverMessage ||
            `Failed to delete lab. HTTP ${response.status}`,
        );
      }

      /*
       * Delete successful.
       */

      router.push("/admin/labs");
      router.refresh();
    } catch (err) {
      console.error(
        "Delete lab error:",
        err,
      );

      if (
        err instanceof TypeError &&
        err.message === "Failed to fetch"
      ) {
        setError(
          `Cannot connect to the CyberLab API at ${API_URL}.`,
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete lab.",
        );
      }

      setDeleting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DIFFICULTY
  |--------------------------------------------------------------------------
  */

  function difficultyClass(
    difficulty: Lab["difficulty"],
  ) {
    switch (difficulty) {
      case "EASY":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";

      case "MEDIUM":
        return "border-yellow-400/20 bg-yellow-400/10 text-yellow-400";

      case "HARD":
        return "border-red-400/20 bg-red-400/10 text-red-400";

      default:
        return "border-white/10 bg-white/5 text-gray-400";
    }
  }

  /*
  |--------------------------------------------------------------------------
  | TARGET TYPE
  |--------------------------------------------------------------------------
  */

  function targetTypeLabel(
    targetType: Lab["target_type"],
  ) {
    switch (targetType) {
      case "WEB":
        return "Web Application";

      case "LINUX":
        return "Linux Machine";

      case "NETWORK":
        return "Network";

      case "CRYPTO":
        return "Cryptography";

      default:
        return targetType;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05080d] text-white">
        <header className="border-b border-white/[0.07]">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8">
            <Link
              href="/admin"
              className="font-mono text-lg font-bold tracking-wider"
            >
              CYBER
              <span className="text-emerald-400">
                LAB
              </span>
            </Link>

            <span className="font-mono text-[10px] text-emerald-400">
              ADMIN
            </span>
          </div>
        </header>

        <section className="mx-auto max-w-[1100px] px-5 py-16 lg:px-8">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-8">
            <div className="font-mono text-xs text-emerald-400">
              LOADING LAB...
            </div>

            <div className="mt-3 font-mono text-[10px] text-gray-600">
              {API_URL}/labs/{id}
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error || !lab) {
    return (
      <main className="min-h-screen bg-[#05080d] text-white">
        <header className="border-b border-white/[0.07]">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8">
            <Link
              href="/admin"
              className="font-mono text-lg font-bold tracking-wider"
            >
              CYBER
              <span className="text-emerald-400">
                LAB
              </span>
            </Link>

            <span className="font-mono text-[10px] text-emerald-400">
              ADMIN
            </span>
          </div>
        </header>

        <section className="mx-auto max-w-[900px] px-5 py-16 lg:px-8">
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-8">
            <div className="font-mono text-[9px] tracking-[0.2em] text-red-400">
              LAB ERROR
            </div>

            <h1 className="mt-3 text-2xl font-bold">
              Unable to load lab
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {error ||
                "The requested lab does not exist."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="rounded-lg bg-emerald-400 px-5 py-3 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300"
              >
                TRY AGAIN
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-white/[0.08] px-5 py-3 font-mono text-xs text-gray-400 transition hover:text-white"
              >
                ← GO BACK
              </button>

              <Link
                href="/admin/labs"
                className="rounded-lg border border-white/[0.08] px-5 py-3 font-mono text-xs text-gray-400 transition hover:border-emerald-400/30 hover:text-emerald-400"
              >
                ALL LABS
              </Link>
            </div>

            <div className="mt-8 rounded-xl border border-white/[0.06] bg-black/20 p-5">
              <div className="font-mono text-[9px] tracking-wider text-gray-600">
                DEBUG INFORMATION
              </div>

              <div className="mt-3 space-y-2 font-mono text-xs">
                <div className="text-gray-500">
                  Lab ID:{" "}
                  <span className="text-gray-300">
                    {String(id)}
                  </span>
                </div>

                <div className="text-gray-500">
                  API:{" "}
                  <span className="text-gray-300">
                    {API_URL}
                  </span>
                </div>

                <div className="break-all text-gray-500">
                  Endpoint:{" "}
                  <span className="text-gray-300">
                    {API_URL}/labs/{String(id)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#05080d] text-white">

      {/* HEADER */}

      <header className="border-b border-white/[0.07]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8">

          <Link
            href="/admin"
            className="font-mono text-lg font-bold tracking-wider"
          >
            CYBER
            <span className="text-emerald-400">
              LAB
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <span className="font-mono text-[10px] text-emerald-400">
              ADMIN
            </span>

            <Link
              href="/admin/labs"
              className="font-mono text-xs text-gray-500 transition hover:text-emerald-400"
            >
              ← ALL LABS
            </Link>
          </div>

        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-[1100px] px-5 py-10 lg:px-8">

        {/* BREADCRUMB */}

        <div className="mb-8 font-mono text-[9px] tracking-[0.18em] text-gray-600">
          CYBERLAB / ADMIN / LABS / {lab.id}
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 font-mono text-xs leading-6 text-red-400">
            ✕ {error}
          </div>
        )}

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-start">

          <div>

            <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
              LAB DETAILS
            </div>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              {lab.title}
            </h1>

            <p className="mt-3 font-mono text-xs text-gray-600">
              /{lab.slug}
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <Link
              href="/admin/labs"
              className="rounded-lg border border-white/[0.08] px-5 py-3 font-mono text-xs text-gray-400 transition hover:text-white"
            >
              ← BACK
            </Link>

            <Link
              href={`/admin/labs/${lab.id}/edit`}
              className="rounded-lg bg-emerald-400 px-5 py-3 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300"
            >
              EDIT LAB
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-400/20 bg-red-400/[0.05] px-5 py-3 font-mono text-xs font-semibold text-red-400 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting
                ? "DELETING..."
                : "DELETE LAB"}
            </button>

          </div>

        </div>

        {/* STATUS */}

        <div className="mb-6 flex flex-wrap gap-3">

          <span
            className={`rounded-full border px-3 py-1.5 font-mono text-[10px] ${difficultyClass(
              lab.difficulty,
            )}`}
          >
            {lab.difficulty}
          </span>

          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] text-gray-400">
            {lab.category}
          </span>

          <span
            className={`rounded-full border px-3 py-1.5 font-mono text-[10px] ${
              lab.is_active === true ||
              lab.is_active === 1 ||
              String(lab.is_active) === "1"
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                : "border-red-400/20 bg-red-400/10 text-red-400"
            }`}
          >
            {lab.is_active === true ||
            lab.is_active === 1 ||
            String(lab.is_active) === "1"
              ? "ACTIVE"
              : "INACTIVE"}
          </span>

        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* MAIN */}

          <div className="space-y-6 lg:col-span-2">

            {/* DESCRIPTION */}

            <section className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">

              <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                LAB DESCRIPTION
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-gray-400">
                {lab.description}
              </p>

            </section>

            {/* TARGET ENVIRONMENT */}

            <section className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">

              <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                TARGET ENVIRONMENT
              </div>

              <div className="mt-6 space-y-5">

                <InfoRow
                  label="TARGET TYPE"
                  value={targetTypeLabel(
                    lab.target_type,
                  )}
                />

                <InfoRow
                  label="TARGET URL"
                  value={
                    lab.target_url ||
                    "Not configured"
                  }
                  mono
                />

                <InfoRow
                  label="DOCKER IMAGE"
                  value={
                    lab.docker_image ||
                    "Not configured"
                  }
                  mono
                />

              </div>

            </section>

            {/* CHALLENGES */}

            <section className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                <div>

                  <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                    CHALLENGES
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    Challenges belonging to this lab.
                  </p>

                </div>

                <Link
                  href={`/admin/challenges/create?labId=${lab.id}`}
                  className="shrink-0 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-2.5 text-center font-mono text-[10px] text-emerald-400 transition hover:bg-emerald-400/10"
                >
                  + CREATE CHALLENGE
                </Link>

              </div>

              {loadingChallenges && (
                <div className="mt-6 rounded-xl border border-white/[0.07] p-8 text-center">
                  <div className="font-mono text-xs text-gray-600">
                    LOADING CHALLENGES...
                  </div>
                </div>
              )}

              {!loadingChallenges &&
                challengeError && (
                  <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/[0.04] p-6">
                    <div className="font-mono text-xs leading-6 text-red-400">
                      ✕ {challengeError}
                    </div>
                  </div>
                )}

              {!loadingChallenges &&
                !challengeError &&
                challenges.length === 0 && (
                  <div className="mt-6 rounded-xl border border-dashed border-white/[0.08] p-8 text-center">

                    <div className="font-mono text-xs text-gray-600">
                      NO CHALLENGES
                    </div>

                    <p className="mt-2 text-xs text-gray-700">
                      Create the first challenge for
                      this lab.
                    </p>

                    <Link
                      href={`/admin/challenges/create?labId=${lab.id}`}
                      className="mt-5 inline-flex rounded-lg bg-emerald-400 px-5 py-3 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300"
                    >
                      CREATE CHALLENGE →
                    </Link>

                  </div>
                )}

              {!loadingChallenges &&
                !challengeError &&
                challenges.length > 0 && (
                  <div className="mt-6 space-y-3">

                    {challenges.map(
                      (challenge) => {

                        const active =
                          challenge.is_active ===
                            true ||
                          challenge.is_active === 1 ||
                          String(
                            challenge.is_active,
                          ) === "1" ||
                          String(
                            challenge.is_active,
                          ).toLowerCase() ===
                            "true";

                        return (
                          <div
                            key={challenge.id}
                            className="rounded-xl border border-white/[0.07] bg-[#05080d] p-5 transition hover:border-emerald-400/20"
                          >

                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                              <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                  <span className="font-mono text-[10px] text-gray-600">
                                    #
                                    {
                                      challenge.order_number
                                    }
                                  </span>

                                  <span
                                    className={`rounded-full border px-2 py-1 font-mono text-[9px] ${
                                      active
                                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                                        : "border-red-400/20 bg-red-400/10 text-red-400"
                                    }`}
                                  >
                                    {active
                                      ? "ACTIVE"
                                      : "INACTIVE"}
                                  </span>

                                </div>

                                <h3 className="mt-3 truncate text-base font-semibold text-white">
                                  {
                                    challenge.title
                                  }
                                </h3>

                                <p className="mt-1 font-mono text-[10px] text-gray-600">
                                  /
                                  {
                                    challenge.slug
                                  }
                                </p>

                                {challenge.description && (
                                  <p className="mt-3 text-sm leading-6 text-gray-500">
                                    {
                                      challenge.description
                                    }
                                  </p>
                                )}

                              </div>

                              <div className="shrink-0 text-left sm:text-right">

                                <div className="font-mono text-sm font-semibold text-emerald-400">
                                  +
                                  {
                                    challenge.points
                                  }{" "}
                                  XP
                                </div>

                                <div className="mt-3">

                                  <Link
                                    href={`/admin/challenges/${challenge.id}`}
                                    className="font-mono text-[10px] text-gray-500 transition hover:text-emerald-400"
                                  >
                                    VIEW →
                                  </Link>

                                </div>

                              </div>

                            </div>

                          </div>
                        );
                      },
                    )}

                  </div>
                )}

            </section>

          </div>

          {/* SIDEBAR */}

          <aside className="space-y-6">

            {/* REWARD */}

            <section className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6">

              <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
                REWARD
              </div>

              <div className="mt-3 text-3xl font-bold text-emerald-400">
                +{lab.points}
              </div>

              <div className="mt-1 font-mono text-[10px] text-gray-600">
                XP
              </div>

            </section>

            {/* METADATA */}

            <section className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6">

              <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                METADATA
              </div>

              <div className="mt-5 space-y-5">

                <InfoRow
                  label="LAB ID"
                  value={String(lab.id)}
                  mono
                />

                <InfoRow
                  label="SLUG"
                  value={lab.slug}
                  mono
                />

                <InfoRow
                  label="CATEGORY"
                  value={lab.category}
                />

                <InfoRow
                  label="DIFFICULTY"
                  value={lab.difficulty}
                />

                <InfoRow
                  label="CREATED"
                  value={
                    lab.created_at
                      ? new Date(
                          lab.created_at,
                        ).toLocaleString()
                      : "Unknown"
                  }
                />

              </div>

            </section>

            {/* DANGER ZONE */}

            <section className="rounded-2xl border border-red-400/10 bg-red-400/[0.02] p-6">

              <div className="font-mono text-[9px] tracking-[0.2em] text-red-400">
                DANGER ZONE
              </div>

              <p className="mt-3 text-xs leading-6 text-gray-600">
                Deleting this lab will also remove
                its challenges. This action cannot
                be undone.
              </p>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="mt-5 w-full rounded-lg border border-red-400/20 bg-red-400/[0.05] px-4 py-3 font-mono text-[10px] font-semibold text-red-400 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "DELETING LAB..."
                  : "DELETE THIS LAB"}
              </button>

            </section>

          </aside>

        </div>

      </section>

    </main>
  );
}

/*
|--------------------------------------------------------------------------
| INFO ROW
|--------------------------------------------------------------------------
*/

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>

      <div className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
        {label}
      </div>

      <div
        className={`mt-2 break-all text-sm text-gray-400 ${
          mono
            ? "font-mono text-xs"
            : ""
        }`}
      >
        {value}
      </div>

    </div>
  );
}