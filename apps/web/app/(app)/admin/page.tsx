"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

type Stats = {
  users: number;
  labs: number;
  challenges: number;
  submissions: number;
  correctSubmissions: number;
};

const QUICK_ACTIONS = [
  {
    label: "Create Lab",
    href: "/admin/labs/create",
    icon: "◈",
    color: "emerald",
    desc: "Publish a new cybersecurity lab environment",
  },
  {
    label: "Create Challenge",
    href: "/admin/challenges/create",
    icon: "⚡",
    color: "yellow",
    desc: "Add a new challenge with flag and hints",
  },
  {
    label: "Manage Users",
    href: "/admin/users",
    icon: "◉",
    color: "blue",
    desc: "View, search and manage student accounts",
  },
  {
    label: "View Submissions",
    href: "/admin/submissions",
    icon: "✦",
    color: "purple",
    desc: "Review all flag submissions and accuracy",
  },
];

const PLATFORM_SECTIONS = [
  {
    title: "Labs",
    href: "/admin/labs",
    icon: "◈",
    desc: "CyberLab environments are containerised learning spaces where students practice real cybersecurity techniques. Each lab contains one or more challenges with defined objectives, flags and point rewards.",
    features: ["Docker-based sandboxes", "Difficulty tiers (Easy / Medium / Hard)", "Category tagging", "XP point system"],
  },
  {
    title: "Challenges",
    href: "/admin/challenges",
    icon: "⚡",
    desc: "Challenges are the atomic units of learning inside a lab. Each challenge presents a task, accepts a flag submission, and awards XP on correct completion. Hints can be attached to guide students progressively.",
    features: ["Flag-based verification", "Configurable point values", "Progressive hints", "Ordered within labs"],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: "◉",
    desc: "All registered platform users. Students accumulate XP, level up and compete on the global leaderboard. Admins have full platform management access. User roles are enforced at both the frontend and API level.",
    features: ["Role-based access (ADMIN / STUDENT)", "XP and level tracking", "Activity history", "JWT authentication"],
  },
  {
    title: "Submissions",
    href: "/admin/submissions",
    icon: "✦",
    desc: "Every flag submission is recorded with the user, challenge, submitted value, correctness result, timestamp and points awarded. Use this to monitor platform engagement and identify popular or problematic challenges.",
    features: ["Full submission audit trail", "Correct / wrong filtering", "Per-user and per-challenge views", "Points awarded logging"],
  },
  {
    title: "Hints",
    href: "/admin/challenges",
    icon: "◎",
    desc: "Hints are attached to challenges to provide graduated assistance. Students can unlock hints at a cost in XP, preserving challenge integrity while reducing frustration. Configure hint content and XP cost per hint.",
    features: ["Ordered hint reveal", "Configurable XP cost", "Per-challenge management", "Linked to challenges"],
  },
  {
    title: "Resources",
    href: "/admin/resources",
    icon: "▣",
    desc: "Learning resources are supplementary reference materials attached to labs. They help students understand the context, tools and techniques needed to solve challenges — without directly revealing solutions.",
    features: ["Linked to lab environments", "URL or text-based content", "Ordered reference materials", "Supports external links"],
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    labs: 0,
    challenges: 0,
    submissions: 0,
    correctSubmissions: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cyberlab_token");
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    Promise.allSettled([
      fetch(`${API_URL}/users`, { headers }).then((r) => r.json()),
      fetch(`${API_URL}/labs`, { headers }).then((r) => r.json()),
      fetch(`${API_URL}/challenges`, { headers }).then((r) => r.json()),
      fetch(`${API_URL}/submissions`, { headers }).then((r) => r.json()),
    ]).then(([usersRes, labsRes, challengesRes, submissionsRes]) => {
      const users =
        usersRes.status === "fulfilled"
          ? (Array.isArray(usersRes.value)
              ? usersRes.value
              : usersRes.value?.data ?? usersRes.value?.users ?? []
            ).length
          : 0;

      const labs =
        labsRes.status === "fulfilled"
          ? (Array.isArray(labsRes.value)
              ? labsRes.value
              : labsRes.value?.labs ?? labsRes.value?.data ?? []
            ).length
          : 0;

      const challenges =
        challengesRes.status === "fulfilled"
          ? (Array.isArray(challengesRes.value)
              ? challengesRes.value
              : challengesRes.value?.challenges ?? challengesRes.value?.data ?? []
            ).length
          : 0;

      const allSubmissions =
        submissionsRes.status === "fulfilled"
          ? Array.isArray(submissionsRes.value)
            ? submissionsRes.value
            : submissionsRes.value?.data ?? []
          : [];

      const correct = allSubmissions.filter(
        (s: any) => s.is_correct === true || s.is_correct === 1
      ).length;

      setStats({
        users,
        labs,
        challenges,
        submissions: allSubmissions.length,
        correctSubmissions: correct,
      });
      setStatsLoading(false);
    });
  }, []);

  const accuracy =
    stats.submissions > 0
      ? Math.round((stats.correctSubmissions / stats.submissions) * 100)
      : 0;

  return (
    <div>
      {/* ================================================ */}
      {/* HEADER */}
      {/* ================================================ */}
      <div className="mb-10">
        <div className="mb-1 font-mono text-[9px] tracking-[0.3em] text-red-400/70">
          CYBERLAB // ADMIN CONSOLE
        </div>
        <h1 className="font-mono text-3xl font-bold tracking-tight">
          Platform Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Welcome to the CyberLab administration console. Manage labs, challenges, users,
          submissions and platform content from this central hub.
        </p>
      </div>

      {/* ================================================ */}
      {/* LIVE STATS */}
      {/* ================================================ */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "USERS", value: stats.users, icon: "◉", color: "text-white" },
          { label: "LABS", value: stats.labs, icon: "◈", color: "text-emerald-400" },
          { label: "CHALLENGES", value: stats.challenges, icon: "⚡", color: "text-yellow-400" },
          { label: "SUBMISSIONS", value: stats.submissions, icon: "✦", color: "text-blue-400" },
          { label: "ACCURACY", value: `${accuracy}%`, icon: "▲", color: "text-purple-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5"
          >
            <div className="flex items-center justify-between">
              <div className="font-mono text-[8px] tracking-[0.2em] text-gray-600">
                {stat.label}
              </div>
              <span className={`text-sm ${stat.color}`}>{stat.icon}</span>
            </div>
            <div className={`mt-3 font-mono text-2xl font-bold ${stat.color}`}>
              {statsLoading ? (
                <span className="animate-pulse text-gray-700">—</span>
              ) : (
                stat.value
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================================================ */}
      {/* QUICK ACTIONS */}
      {/* ================================================ */}
      <div className="mb-10">
        <div className="mb-4 font-mono text-[9px] tracking-[0.2em] text-gray-600">
          QUICK ACTIONS
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-400/20 hover:bg-white/[0.04]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] font-mono text-lg text-gray-400 transition group-hover:border-emerald-400/20 group-hover:text-emerald-400">
                {action.icon}
              </div>
              <div className="font-mono text-sm font-semibold text-white">
                {action.label}
              </div>
              <p className="mt-1.5 text-xs leading-5 text-gray-600">
                {action.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ================================================ */}
      {/* PLATFORM SECTION GUIDE */}
      {/* ================================================ */}
      <div className="mb-5 flex items-center gap-4">
        <div className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
          PLATFORM SECTIONS
        </div>
        <div className="flex-1 border-t border-white/[0.06]" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="group flex flex-col rounded-xl border border-white/[0.07] bg-[#070c12] p-6 transition hover:border-white/[0.12]"
          >
            {/* ICON + TITLE */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] font-mono text-base text-gray-400">
                {section.icon}
              </div>
              <h2 className="font-mono text-sm font-bold tracking-wide text-white">
                {section.title}
              </h2>
            </div>

            {/* DESCRIPTION */}
            <p className="mb-5 flex-1 text-xs leading-6 text-gray-500">
              {section.desc}
            </p>

            {/* FEATURES */}
            <ul className="mb-5 space-y-1.5">
              {section.features.map((feat) => (
                <li
                  key={feat}
                  className="flex items-center gap-2 font-mono text-[10px] text-gray-600"
                >
                  <span className="text-emerald-400">▸</span>
                  {feat}
                </li>
              ))}
            </ul>

            {/* LINK */}
            <Link
              href={section.href}
              className="inline-flex items-center gap-2 font-mono text-[10px] text-emerald-400 transition hover:text-emerald-300"
            >
              MANAGE {section.title.toUpperCase()} →
            </Link>
          </div>
        ))}
      </div>

      {/* ================================================ */}
      {/* SYSTEM INFO */}
      {/* ================================================ */}
      <div className="mt-10 rounded-xl border border-white/[0.06] bg-[#070c12] p-6">
        <div className="mb-5 font-mono text-[9px] tracking-[0.2em] text-gray-600">
          SYSTEM INFORMATION
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: "API Server", status: "ONLINE", note: "NestJS REST API" },
            { name: "Database", status: "CONNECTED", note: "SQLite / MySQL" },
            { name: "Auth System", status: "ACTIVE", note: "JWT Bearer tokens" },
          ].map((sys) => (
            <div
              key={sys.name}
              className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-black/20 px-4 py-3"
            >
              <div>
                <div className="font-mono text-xs text-gray-400">{sys.name}</div>
                <div className="mt-0.5 font-mono text-[9px] text-gray-700">{sys.note}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                <span className="font-mono text-[9px] text-emerald-500">{sys.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}