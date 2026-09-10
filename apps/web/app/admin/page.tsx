
"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      {/* HEADER */}
      <header className="border-b border-white/[0.07] bg-[#05080d]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8">
          <Link
            href="/dashboard"
            className="font-mono text-lg font-bold tracking-wider"
          >
            CYBER<span className="text-emerald-400">LAB</span>
          </Link>

          <div className="flex items-center gap-5">
            <span className="font-mono text-[10px] text-emerald-400">
              ADMIN
            </span>

            <Link
              href="/dashboard"
              className="font-mono text-xs text-gray-500 transition hover:text-white"
            >
              USER DASHBOARD →
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-[1400px] px-5 py-10 lg:px-8">
        {/* TITLE */}
        <div className="mb-10">
          <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
            CYBERLAB / ADMINISTRATION
          </div>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
            Manage CyberLab labs, challenges, users, submissions and
            platform content.
          </p>
        </div>

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="TOTAL LABS"
            value="0"
            description="Published labs"
          />

          <StatCard
            label="CHALLENGES"
            value="0"
            description="Active challenges"
          />

          <StatCard
            label="USERS"
            value="0"
            description="Registered users"
          />

          <StatCard
            label="SUBMISSIONS"
            value="0"
            description="Flag submissions"
          />
        </div>

        {/* MANAGEMENT */}
        <div className="mt-8">
          <div className="mb-5 font-mono text-[9px] tracking-[0.2em] text-gray-600">
            MANAGEMENT
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <AdminCard
              title="Labs"
              description="Create, edit and manage CyberLab environments."
              href="/admin/labs"
              action="MANAGE LABS"
            />

            <AdminCard
              title="Challenges"
              description="Create challenges, configure objectives, flags and XP."
              href="/admin/challenges"
              action="MANAGE CHALLENGES"
            />

            <AdminCard
              title="Users"
              description="View users, roles, XP, levels and activity."
              href="/admin/users"
              action="MANAGE USERS"
            />

            <AdminCard
              title="Submissions"
              description="Review flag submissions and challenge activity."
              href="/admin/submissions"
              action="VIEW SUBMISSIONS"
            />

            <AdminCard
              title="Hints"
              description="Manage progressive hints and hint costs."
              href="/admin/challenges"
              action="MANAGE HINTS"
            />

            <AdminCard
              title="Resources"
              description="Manage learning resources attached to labs."
              href="/admin/resources"
              action="MANAGE RESOURCES"
            />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-10 rounded-2xl border border-emerald-400/10 bg-[#0a1019] p-6 sm:p-8">
          <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
            QUICK ACTIONS
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/labs/create"
              className="rounded-lg bg-emerald-400 px-5 py-3 font-mono text-[10px] font-semibold text-black transition hover:bg-emerald-300"
            >
              + CREATE LAB
            </Link>

            <Link
              href="/admin/challenges/create"
              className="rounded-lg border border-white/[0.1] px-5 py-3 font-mono text-[10px] text-gray-400 transition hover:border-emerald-400/30 hover:text-emerald-400"
            >
              + CREATE CHALLENGE
            </Link>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="mt-8 rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6">
          <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
            SYSTEM STATUS
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <StatusItem
              name="API"
              status="ONLINE"
            />

            <StatusItem
              name="DATABASE"
              status="CONNECTED"
            />

            <StatusItem
              name="LAB ENGINE"
              status="NOT CONFIGURED"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/* ================================================================ */
/* STAT CARD */
/* ================================================================ */

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6">
      <div className="font-mono text-[9px] tracking-[0.15em] text-gray-600">
        {label}
      </div>

      <div className="mt-3 text-3xl font-bold">
        {value}
      </div>

      <div className="mt-2 text-xs text-gray-600">
        {description}
      </div>
    </div>
  );
}

/* ================================================================ */
/* ADMIN CARD */
/* ================================================================ */

function AdminCard({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 transition hover:border-emerald-400/20">
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="mt-3 min-h-[48px] text-sm leading-6 text-gray-600">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex font-mono text-[10px] text-emerald-400 transition hover:text-emerald-300"
      >
        {action} →
      </Link>
    </div>
  );
}

/* ================================================================ */
/* STATUS ITEM */
/* ================================================================ */

function StatusItem({
  name,
  status,
}: {
  name: string;
  status: string;
}) {
  const online =
    status === "ONLINE" || status === "CONNECTED";

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/20 px-4 py-3">
      <span className="font-mono text-xs text-gray-500">
        {name}
      </span>

      <span
        className={`font-mono text-[9px] ${
          online
            ? "text-emerald-400"
            : "text-yellow-400"
        }`}
      >
        ● {status}
      </span>
    </div>
  );
}
