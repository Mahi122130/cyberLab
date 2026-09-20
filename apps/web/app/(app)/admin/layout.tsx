"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type User = {
  id: number;
  username: string;
  role: string;
};

const NAV_ITEMS = [
  {
    section: "CONTENT",
    links: [
      { href: "/admin", label: "Dashboard", icon: "⊞", exact: true },
      { href: "/admin/labs", label: "Labs", icon: "◈" },
      { href: "/admin/challenges", label: "Challenges", icon: "⚡" },
    ],
  },
  {
    section: "PLATFORM",
    links: [
      { href: "/admin/users", label: "Users", icon: "◉" },
      { href: "/admin/submissions", label: "Submissions", icon: "✦" },
      { href: "/admin/hints", label: "Hints", icon: "◎" },
      { href: "/admin/resources", label: "Resources", icon: "▣" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cyberlab_token");
    const storedUser = localStorage.getItem("cyberlab_user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsed: User = JSON.parse(storedUser);
      if (parsed.role !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }
      setUser(parsed);
    } catch {
      localStorage.removeItem("cyberlab_user");
      localStorage.removeItem("cyberlab_token");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("cyberlab_user");
    localStorage.removeItem("cyberlab_token");
    router.replace("/login");
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== "/admin";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d]">
        <div className="text-center">
          <div className="mb-3 font-mono text-[10px] tracking-[0.3em] text-emerald-400">
            CYBERLAB
          </div>
          <div className="font-mono text-[9px] tracking-wider text-gray-600">
            VERIFYING ADMIN ACCESS...
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#05080d] text-white">
      {/* ======================================================= */}
      {/* ADMIN SIDEBAR */}
      {/* ======================================================= */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-[#070c12]">

        {/* LOGO */}
        <div className="flex h-16 items-center border-b border-white/[0.06] px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/40 bg-red-400/10 font-mono text-xs font-bold text-red-400">
              ⚡
            </div>
            <div>
              <div className="font-mono text-sm font-bold tracking-wider">
                CYBER<span className="text-red-400">LAB</span>
              </div>
              <div className="font-mono text-[7px] tracking-[0.2em] text-gray-700">
                ADMIN CONSOLE
              </div>
            </div>
          </Link>
        </div>

        {/* ADMIN BADGE */}
        <div className="border-b border-white/[0.05] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-red-400/30 bg-red-400/10 font-mono text-[10px] font-bold text-red-400">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-mono text-xs font-medium text-white">
                {user.username}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <span className="font-mono text-[9px] tracking-wider text-red-400">
                  ADMINISTRATOR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {NAV_ITEMS.map((group) => (
            <div key={group.section} className="mb-7">
              <div className="mb-2 px-3 font-mono text-[8px] tracking-[0.25em] text-gray-700">
                {group.section}
              </div>
              <div className="space-y-0.5">
                {group.links.map((link) => {
                  const active = isActive(link.href, link.exact);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-xs transition-all ${
                        active
                          ? "border border-red-400/15 bg-red-400/[0.07] text-red-400"
                          : "text-gray-500 hover:bg-white/[0.03] hover:text-gray-300"
                      }`}
                    >
                      <span className="w-4 text-center text-sm">
                        {link.icon}
                      </span>
                      {link.label}
                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="border-t border-white/[0.06] p-4 space-y-2">
          {/* View Student App */}
          <Link
            href="/dashboard"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-xs text-gray-600 transition hover:bg-white/[0.03] hover:text-emerald-400"
          >
            <span className="w-4 text-center">↗</span>
            Student App
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-xs text-gray-600 transition hover:bg-red-400/[0.05] hover:text-red-400"
          >
            <span className="w-4 text-center">↪</span>
            Logout
          </button>

          {/* Status */}
          <div className="mt-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8px] tracking-wider text-gray-700">
                SYSTEM STATUS
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="font-mono text-[8px] text-emerald-500">ONLINE</span>
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ======================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ======================================================= */}
      <div className="ml-64 flex flex-1 flex-col">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#05080d]/95 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.2em] text-gray-600">
            <span className="text-red-400">ADMIN</span>
            <span>/</span>
            <span className="text-gray-500 capitalize">
              {pathname === "/admin"
                ? "Dashboard"
                : pathname.split("/admin/")[1]?.split("/")[0] || ""}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-md border border-red-400/20 bg-red-400/5 px-3 py-1.5 font-mono text-[9px] tracking-wider text-red-400">
              ADMIN MODE
            </div>
            <Link
              href="/admin/labs/create"
              className="rounded-lg bg-emerald-400 px-4 py-2 font-mono text-[10px] font-semibold text-black transition hover:bg-emerald-300"
            >
              + CREATE LAB
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
