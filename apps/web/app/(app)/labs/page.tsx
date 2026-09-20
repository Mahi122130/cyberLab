
"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Difficulty =
  | "EASY"
  | "MEDIUM"
  | "HARD";

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

type LabsResponse = {
  success: boolean;
  labs: Lab[];
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1";

export default function LabsPage() {
  const { t } = useI18n();
  const [labs, setLabs] =
    useState<Lab[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [difficulty, setDifficulty] =
    useState<"ALL" | Difficulty>("ALL");

  const [category, setCategory] =
    useState("ALL");

  // ================================================================
  // FETCH LABS
  // ================================================================

  const fetchLabs = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/labs`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        let data: LabsResponse | null =
          null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Failed to load labs. HTTP ${response.status}`
          );
        }

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Failed to load labs."
          );
        }

        // Only active labs
        const activeLabs =
          Array.isArray(data.labs)
            ? data.labs.filter(
                (lab) =>
                  lab.is_active === true ||
                  lab.is_active === 1 ||
                  String(
                    lab.is_active
                  ) === "1" ||
                  String(
                    lab.is_active
                  ).toLowerCase() ===
                    "true"
              )
            : [];

        setLabs(activeLabs);
      } catch (err) {
        console.error(
          "Failed to load labs:",
          err
        );

        if (
          err instanceof TypeError &&
          err.message === "Failed to fetch"
        ) {
          setError(
            `Cannot connect to the CyberLab API at ${API_URL}. Make sure the NestJS backend is running and CORS is configured correctly.`
          );
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading labs."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ================================================================
  // INITIAL LOAD
  // ================================================================

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  // ================================================================
  // CATEGORIES
  // ================================================================

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        labs
          .map((lab) => lab.category)
          .filter(Boolean)
      )
    ).sort();
  }, [labs]);

  // ================================================================
  // FILTER
  // ================================================================

  const filteredLabs = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return labs.filter((lab) => {
      const matchesSearch =
        !searchValue ||
        lab.title
          .toLowerCase()
          .includes(searchValue) ||
        lab.description
          .toLowerCase()
          .includes(searchValue) ||
        lab.slug
          .toLowerCase()
          .includes(searchValue) ||
        lab.category
          .toLowerCase()
          .includes(searchValue);

      const matchesDifficulty =
        difficulty === "ALL" ||
        lab.difficulty === difficulty;

      const matchesCategory =
        category === "ALL" ||
        lab.category === category;

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesCategory
      );
    });
  }, [
    labs,
    search,
    difficulty,
    category,
  ]);

  // ================================================================
  // PAGE
  // ================================================================

  return (
    <div className="w-full h-full">
      <section className="mx-auto max-w-[1400px] px-5 py-12 lg:px-8">
        {/* INTRO */}

        <div className="max-w-3xl">
          <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
            {t.cybersecurityTraining}
          </div>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {t.securityLabs}
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
            Practice real cybersecurity skills
            through hands-on challenges. Choose
            a laboratory, solve the challenges and
            earn XP.
          </p>
        </div>

        {/* FILTERS */}

        <section className="mt-10 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_180px_220px_auto]">
            {/* SEARCH */}

            <div>
              <label
                htmlFor="lab-search"
                className="font-mono text-[9px] tracking-[0.15em] text-gray-600"
              >
                SEARCH
              </label>

              <input
                id="lab-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder={t.searchLabsPlaceholder}
                className="mt-2 h-11 w-full rounded-lg border border-white/[0.08] bg-[#05080d] px-4 font-mono text-xs text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/40"
              />
            </div>

            {/* DIFFICULTY */}

            <div>
              <label
                htmlFor="difficulty"
                className="font-mono text-[9px] tracking-[0.15em] text-gray-600"
              >
                DIFFICULTY
              </label>

              <select
                id="difficulty"
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(
                    event.target
                      .value as
                      | "ALL"
                      | Difficulty
                  )
                }
                className="mt-2 h-11 w-full rounded-lg border border-white/[0.08] bg-[#05080d] px-3 font-mono text-xs text-white outline-none focus:border-emerald-400/40"
              >
                <option value="ALL">
                  All difficulties
                </option>

                <option value="EASY">
                  Easy
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HARD">
                  Hard
                </option>
              </select>
            </div>

            {/* CATEGORY */}

            <div>
              <label
                htmlFor="category"
                className="font-mono text-[9px] tracking-[0.15em] text-gray-600"
              >
                CATEGORY
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-lg border border-white/[0.08] bg-[#05080d] px-3 font-mono text-xs text-white outline-none focus:border-emerald-400/40"
              >
                <option value="ALL">
                  All categories
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* REFRESH */}

            <div className="flex items-end">
              <button
                type="button"
                onClick={fetchLabs}
                disabled={loading}
                className="h-11 w-full rounded-lg border border-white/[0.08] px-5 font-mono text-xs text-gray-400 transition hover:border-emerald-400/30 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
              >
                {loading
                  ? t.loadingCaps
                  : t.refresh}
              </button>
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/[0.04] p-5">
            <div className="font-mono text-xs font-semibold text-red-400">
              {t.apiError}
            </div>

            <p className="mt-2 font-mono text-xs leading-6 text-red-300/70">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchLabs}
              className="mt-4 h-9 rounded-lg border border-red-400/20 px-4 font-mono text-[10px] text-red-400 transition hover:bg-red-400/10"
            >
              {t.tryAgain}
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl border border-white/[0.07] bg-[#0a1019]"
              />
            ))}
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredLabs.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.07] bg-[#05080d] font-mono text-xl text-gray-600">
                ∅
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                {labs.length === 0
                  ? t.noLabsAvailable
                  : t.noLabsFound}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
                {labs.length === 0
                  ? t.noLabsDesc1
                  : t.noLabsDesc2}
              </p>
            </div>
          )}

        {/* RESULTS */}

        {!loading &&
          !error &&
          filteredLabs.length > 0 && (
            <div className="w-full h-full">
              <div className="mt-8 flex items-center justify-between">
                <div className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
                  {t.availableLabs}
                </div>

                <div className="font-mono text-[10px] text-gray-700">
                  {filteredLabs.length} LAB
                  {filteredLabs.length ===
                  1
                    ? ""
                    : "S"}
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredLabs.map(
                  (lab) => (
                    <LabCard key={lab.id} lab={lab} t={t} />
                  )
                )}
              </div>
            </div>
          )}
      </section>
    </div>
  );
}

// ================================================================
// LAB CARD
// ================================================================

function LabCard({
  t,
  lab,
}: {
  lab: Lab;
  t: any;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a1019] transition hover:-translate-y-1 hover:border-emerald-400/20">
      <div className="border-b border-white/[0.06] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] font-mono text-xs text-emerald-400">
            {String(lab.id).padStart(
              2,
              "0"
            )}
          </div>

          <DifficultyBadge
            difficulty={lab.difficulty}
          />
        </div>

        <h2 className="mt-6 text-xl font-semibold transition group-hover:text-emerald-400">
          {lab.title}
        </h2>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
          {lab.description}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="grid grid-cols-2 gap-3">
          <Detail
            label="CATEGORY"
            value={lab.category}
          />

          <Detail
            label={t.target}
            value={lab.target_type}
          />

          <Detail
            label={t.reward}
            value={`+${lab.points} XP`}
            accent
          />

          <Detail
            label={t.status}
            value={t.active}
            accent
          />
        </div>

        <div className="mt-6">
          <Link
            href={`/labs/${lab.id}`}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-emerald-400 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300"
          >
            {t.startLabBtn}
          </Link>
        </div>
      </div>
    </article>
  );
}

// ================================================================
// DIFFICULTY BADGE
// ================================================================

function DifficultyBadge({
  difficulty,
}: {
  difficulty: Difficulty;
}) {
  const styles: Record<
    Difficulty,
    string
  > = {
    EASY:
      "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-400",

    MEDIUM:
      "border-yellow-400/20 bg-yellow-400/[0.05] text-yellow-400",

    HARD:
      "border-red-400/20 bg-red-400/[0.05] text-red-400",
  };

  return (
    <span
      className={`rounded-md border px-2.5 py-1 font-mono text-[9px] ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

// ================================================================
// DETAIL
// ================================================================

function Detail({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-[#05080d] p-3">
      <div className="font-mono text-[8px] tracking-[0.12em] text-gray-700">
        {label}
      </div>

      <div
        className={`mt-1 font-mono text-xs ${
          accent
            ? "text-emerald-400"
            : "text-gray-400"
        }`}
      >
        {value}
      </div>
    </div>
  );
}


