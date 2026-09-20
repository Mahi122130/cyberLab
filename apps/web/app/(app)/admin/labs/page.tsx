"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

type LabsResponse = {
  success: boolean;
  labs: Lab[];
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

export default function AdminLabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [difficultyFilter, setDifficultyFilter] =
    useState<"ALL" | Difficulty>("ALL");

  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [deleteError, setDeleteError] =
    useState("");

  /*
   * =========================================================
   * LOAD LABS
   * =========================================================
   */

  const fetchLabs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/labs`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      let data: LabsResponse | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load labs. HTTP ${response.status}`,
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Failed to load labs.",
        );
      }

      setLabs(
        Array.isArray(data.labs)
          ? data.labs
          : [],
      );
    } catch (err) {
      if (
        err instanceof TypeError &&
        err.message === "Failed to fetch"
      ) {
        setError(
          `Cannot connect to the CyberLab API. Make sure NestJS is running on ${API_URL}.`,
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading labs.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  /*
   * =========================================================
   * DELETE LAB
   * =========================================================
   */

  async function deleteLab(lab: Lab) {
    if (deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${lab.title}"?\n\n` +
        `This will permanently delete the lab and its challenges.\n\n` +
        `This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(lab.id);
    setDeleteError("");

    try {
      const response = await fetch(
        `${API_URL}/labs/${lab.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        },
      );

      let data: {
        success?: boolean;
        message?: string;
      } | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to delete lab. HTTP ${response.status}`,
        );
      }

      if (data?.success === false) {
        throw new Error(
          data.message ||
            "Failed to delete lab.",
        );
      }

      /*
       * Remove it immediately from the UI.
       */
      setLabs((currentLabs) =>
        currentLabs.filter(
          (item) => item.id !== lab.id,
        ),
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete lab.";

      setDeleteError(message);
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * =========================================================
   * FILTERING
   * =========================================================
   */

  const categories = Array.from(
    new Set(
      labs
        .map((lab) => lab.category)
        .filter(Boolean),
    ),
  ).sort();

  const filteredLabs = labs.filter((lab) => {
    const searchValue = search
      .trim()
      .toLowerCase();

    const matchesSearch =
      !searchValue ||
      lab.title
        .toLowerCase()
        .includes(searchValue) ||
      lab.slug
        .toLowerCase()
        .includes(searchValue) ||
      lab.description
        .toLowerCase()
        .includes(searchValue) ||
      lab.category
        .toLowerCase()
        .includes(searchValue);

    const matchesDifficulty =
      difficultyFilter === "ALL" ||
      lab.difficulty === difficultyFilter;

    const matchesCategory =
      categoryFilter === "ALL" ||
      lab.category === categoryFilter;

    return (
      matchesSearch &&
      matchesDifficulty &&
      matchesCategory
    );
  });

  /*
   * =========================================================
   * STATS
   * =========================================================
   */

  const activeLabs = labs.filter(
    (lab) => Boolean(lab.is_active),
  ).length;

  const totalPoints = labs.reduce(
    (total, lab) =>
      total + Number(lab.points || 0),
    0,
  );

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-white/[0.07] bg-[#05080d]">
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
            <span className="font-mono text-[10px] tracking-[0.15em] text-emerald-400">
              ADMIN
            </span>

            <Link
              href="/admin"
              className="font-mono text-xs text-gray-500 transition hover:text-white"
            >
              ← DASHBOARD
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-[1400px] px-5 py-10 lg:px-8">
        {/* BREADCRUMB */}

        <div className="mb-8 font-mono text-[9px] tracking-[0.18em] text-gray-600">
          CYBERLAB / ADMIN / LABS
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
              LAB MANAGEMENT
            </div>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Labs
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
              Create, manage and configure the
              cybersecurity laboratories available
              to students.
            </p>
          </div>

          <Link
            href="/admin/labs/create"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-emerald-400 px-6 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300"
          >
            + CREATE LAB
          </Link>
        </div>

        {/* =================================================
            STATS
        ================================================== */}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="TOTAL LABS"
            value={labs.length}
          />

          <StatCard
            label="ACTIVE LABS"
            value={activeLabs}
          />

          <StatCard
            label="TOTAL XP"
            value={totalPoints}
            suffix="XP"
          />
        </div>

        {/* =================================================
            DELETE ERROR
        ================================================== */}

        {deleteError && (
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-mono text-xs font-semibold text-red-400">
                DELETE FAILED
              </div>

              <p className="mt-2 font-mono text-xs leading-6 text-red-300/70">
                {deleteError}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setDeleteError("")
              }
              className="h-9 rounded-lg border border-red-400/20 px-4 font-mono text-[10px] text-red-400 hover:bg-red-400/10"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* =================================================
            FILTERS
        ================================================== */}

        <section className="mt-8 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_180px_220px_auto]">
            {/* SEARCH */}

            <div>
              <label className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
                SEARCH LABS
              </label>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by title, slug, category..."
                className="mt-2 h-11 w-full rounded-lg border border-white/[0.08] bg-[#05080d] px-4 font-mono text-xs text-white outline-none transition placeholder:text-gray-700 focus:border-emerald-400/40"
              />
            </div>

            {/* DIFFICULTY */}

            <div>
              <label className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
                DIFFICULTY
              </label>

              <select
                value={difficultyFilter}
                onChange={(event) =>
                  setDifficultyFilter(
                    event.target.value as
                      | "ALL"
                      | Difficulty,
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
              <label className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
                CATEGORY
              </label>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value,
                  )
                }
                className="mt-2 h-11 w-full rounded-lg border border-white/[0.08] bg-[#05080d] px-3 font-mono text-xs text-white outline-none focus:border-emerald-400/40"
              >
                <option value="ALL">
                  All categories
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ),
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
                  ? "LOADING..."
                  : "↻ REFRESH"}
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            API ERROR
        ================================================== */}

        {error && (
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-red-400/20 bg-red-400/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-mono text-xs font-semibold text-red-400">
                API ERROR
              </div>

              <p className="mt-2 font-mono text-xs leading-6 text-red-300/70">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchLabs}
              className="h-10 rounded-lg border border-red-400/20 px-5 font-mono text-xs text-red-400 transition hover:bg-red-400/10"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================== */}

        {loading &&
          labs.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-12 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

              <p className="mt-5 font-mono text-xs text-gray-600">
                LOADING LABS...
              </p>
            </div>
          )}

        {/* =================================================
            EMPTY
        ================================================== */}

        {!loading &&
          !error &&
          filteredLabs.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.07] bg-[#05080d] font-mono text-xl text-gray-600">
                ∅
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                {labs.length === 0
                  ? "No labs created yet"
                  : "No labs match your filters"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
                {labs.length === 0
                  ? "Create your first cybersecurity lab to make it available for challenge configuration."
                  : "Try changing the search or filter options."}
              </p>

              {labs.length === 0 && (
                <Link
                  href="/admin/labs/create"
                  className="mt-6 inline-flex h-11 items-center rounded-lg bg-emerald-400 px-6 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300"
                >
                  + CREATE YOUR FIRST LAB
                </Link>
              )}
            </div>
          )}

        {/* =================================================
            LAB TABLE
        ================================================== */}

        {filteredLabs.length > 0 && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a1019]">
            {/* TABLE HEADER */}

            <div className="flex flex-col justify-between gap-3 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center">
              <div>
                <div className="font-mono text-[9px] tracking-[0.18em] text-emerald-400">
                  LAB CATALOG
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  Showing{" "}
                  <span className="text-white">
                    {filteredLabs.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-white">
                    {labs.length}
                  </span>{" "}
                  labs
                </div>
              </div>

              <div className="font-mono text-[9px] text-gray-700">
                LIVE DATABASE
              </div>
            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05] text-left">
                    <th className="px-5 py-4 font-mono text-[9px] tracking-[0.12em] text-gray-600">
                      LAB
                    </th>

                    <th className="px-5 py-4 font-mono text-[9px] tracking-[0.12em] text-gray-600">
                      CATEGORY
                    </th>

                    <th className="px-5 py-4 font-mono text-[9px] tracking-[0.12em] text-gray-600">
                      DIFFICULTY
                    </th>

                    <th className="px-5 py-4 font-mono text-[9px] tracking-[0.12em] text-gray-600">
                      XP
                    </th>

                    <th className="px-5 py-4 font-mono text-[9px] tracking-[0.12em] text-gray-600">
                      TARGET
                    </th>

                    <th className="px-5 py-4 font-mono text-[9px] tracking-[0.12em] text-gray-600">
                      STATUS
                    </th>

                    <th className="px-5 py-4 text-right font-mono text-[9px] tracking-[0.12em] text-gray-600">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLabs.map(
                    (lab) => (
                      <LabRow
                        key={lab.id}
                        lab={lab}
                        deletingId={
                          deletingId
                        }
                        onDelete={
                          deleteLab
                        }
                      />
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================== */}

            <div className="divide-y divide-white/[0.05] md:hidden">
              {filteredLabs.map(
                (lab) => (
                  <MobileLabCard
                    key={lab.id}
                    lab={lab}
                    deletingId={
                      deletingId
                    }
                    onDelete={
                      deleteLab
                    }
                  />
                ),
              )}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

/* ================================================================
   DESKTOP LAB ROW
================================================================ */

function LabRow({
  lab,
  deletingId,
  onDelete,
}: {
  lab: Lab;
  deletingId: number | null;
  onDelete: (lab: Lab) => void;
}) {
  const isActive = Boolean(
    lab.is_active,
  );

  const deleting =
    deletingId === lab.id;

  return (
    <tr className="group border-b border-white/[0.04] transition hover:bg-white/[0.015]">
      {/* LAB */}

      <td className="px-5 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] font-mono text-xs text-emerald-400">
            {String(lab.id).padStart(
              2,
              "0",
            )}
          </div>

          <div className="min-w-0">
            <Link
              href={`/admin/labs/${lab.id}`}
              className="font-medium text-white transition hover:text-emerald-400"
            >
              {lab.title}
            </Link>

            <div className="mt-1 font-mono text-[10px] text-gray-700">
              /{lab.slug}
            </div>
          </div>
        </div>
      </td>

      {/* CATEGORY */}

      <td className="px-5 py-5">
        <span className="font-mono text-xs text-gray-400">
          {lab.category}
        </span>
      </td>

      {/* DIFFICULTY */}

      <td className="px-5 py-5">
        <DifficultyBadge
          difficulty={
            lab.difficulty
          }
        />
      </td>

      {/* XP */}

      <td className="px-5 py-5">
        <span className="font-mono text-xs text-emerald-400">
          +{lab.points} XP
        </span>
      </td>

      {/* TARGET */}

      <td className="px-5 py-5">
        <TargetBadge
          targetType={
            lab.target_type
          }
        />
      </td>

      {/* STATUS */}

      <td className="px-5 py-5">
        <StatusBadge
          active={isActive}
        />
      </td>

      {/* ACTIONS */}

      <td className="px-5 py-5">
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/labs/${lab.id}`}
            className="inline-flex h-9 items-center rounded-lg border border-white/[0.08] px-4 font-mono text-[10px] text-gray-400 transition hover:border-emerald-400/30 hover:text-emerald-400"
          >
            MANAGE
          </Link>

          <Link
            href={`/admin/labs/${lab.id}/edit`}
            className="inline-flex h-9 items-center rounded-lg border border-yellow-400/10 bg-yellow-400/[0.03] px-4 font-mono text-[10px] text-yellow-500 transition hover:border-yellow-400/30 hover:bg-yellow-400/[0.08]"
          >
            EDIT
          </Link>

          <button
            type="button"
            onClick={() =>
              onDelete(lab)
            }
            disabled={deleting}
            className="inline-flex h-9 items-center rounded-lg border border-red-400/20 bg-red-400/[0.03] px-4 font-mono text-[10px] text-red-400 transition hover:bg-red-400/[0.10] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting
              ? "DELETING..."
              : "DELETE"}
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ================================================================
   MOBILE LAB CARD
================================================================ */

function MobileLabCard({
  lab,
  deletingId,
  onDelete,
}: {
  lab: Lab;
  deletingId: number | null;
  onDelete: (lab: Lab) => void;
}) {
  const isActive = Boolean(
    lab.is_active,
  );

  const deleting =
    deletingId === lab.id;

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] font-mono text-xs text-emerald-400">
            {String(lab.id).padStart(
              2,
              "0",
            )}
          </div>

          <div className="min-w-0">
            <Link
              href={`/admin/labs/${lab.id}`}
              className="font-medium text-white hover:text-emerald-400"
            >
              {lab.title}
            </Link>

            <p className="mt-1 truncate font-mono text-[10px] text-gray-700">
              /{lab.slug}
            </p>
          </div>
        </div>

        <StatusBadge
          active={isActive}
        />
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">
        {lab.description}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoItem
          label="CATEGORY"
          value={lab.category}
        />

        <InfoItem
          label="DIFFICULTY"
          value={
            lab.difficulty
          }
        />

        <InfoItem
          label="XP"
          value={`+${lab.points}`}
          accent
        />

        <InfoItem
          label="TARGET"
          value={
            lab.target_type
          }
        />
      </div>

      {/* MOBILE ACTIONS */}

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Link
          href={`/admin/labs/${lab.id}`}
          className="flex h-10 items-center justify-center rounded-lg border border-white/[0.08] font-mono text-[10px] text-gray-400 transition hover:border-emerald-400/30 hover:text-emerald-400"
        >
          MANAGE
        </Link>

        <Link
          href={`/admin/labs/${lab.id}/edit`}
          className="flex h-10 items-center justify-center rounded-lg border border-yellow-400/10 bg-yellow-400/[0.03] font-mono text-[10px] text-yellow-500 transition hover:border-yellow-400/30"
        >
          EDIT
        </Link>

        <button
          type="button"
          onClick={() =>
            onDelete(lab)
          }
          disabled={deleting}
          className="flex h-10 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/[0.03] font-mono text-[10px] text-red-400 transition hover:bg-red-400/[0.10] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting
            ? "..."
            : "DELETE"}
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   STAT CARD
================================================================ */

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-5">
      <div className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
        {label}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">
          {value.toLocaleString()}
        </span>

        {suffix && (
          <span className="font-mono text-[10px] text-emerald-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   DIFFICULTY BADGE
================================================================ */

function DifficultyBadge({
  difficulty,
}: {
  difficulty: Difficulty;
}) {
  const styles = {
    EASY:
      "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-400",

    MEDIUM:
      "border-yellow-400/20 bg-yellow-400/[0.05] text-yellow-400",

    HARD:
      "border-red-400/20 bg-red-400/[0.05] text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 font-mono text-[9px] ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

/* ================================================================
   TARGET BADGE
================================================================ */

function TargetBadge({
  targetType,
}: {
  targetType: TargetType;
}) {
  const labels: Record<
    TargetType,
    string
  > = {
    WEB: "WEB",
    LINUX: "LINUX",
    NETWORK: "NETWORK",
    CRYPTO: "CRYPTO",
  };

  return (
    <span className="inline-flex rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 font-mono text-[9px] text-gray-500">
      {labels[targetType]}
    </span>
  );
}

/* ================================================================
   STATUS BADGE
================================================================ */

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[9px] ${
        active
          ? "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-400"
          : "border-gray-400/10 bg-gray-400/[0.03] text-gray-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-400"
            : "bg-gray-600"
        }`}
      />

      {active
        ? "ACTIVE"
        : "INACTIVE"}
    </span>
  );
}

/* ================================================================
   INFO ITEM
================================================================ */

function InfoItem({
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