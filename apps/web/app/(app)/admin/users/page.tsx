"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  points: number;
  level: number;
  created_at?: string;
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("cyberlab_token");
    const storedUser = localStorage.getItem("cyberlab_user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load users (${res.status}): ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.users)
          ? data.users
          : [];
        setUsers(list);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load users."
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const studentCount = users.filter((u) => u.role !== "ADMIN").length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="font-mono text-sm text-emerald-400">
          LOADING USERS...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="mb-8">
        <div className="font-mono text-[9px] tracking-[0.3em] text-emerald-400/70">
          ADMIN / USERS
        </div>
        <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight">
          User Management
        </h1>
        <p className="mt-1 font-mono text-xs text-gray-500">
          View and manage all registered CyberLab users
        </p>
      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "TOTAL USERS", value: users.length, color: "text-white" },
          { label: "STUDENTS", value: studentCount, color: "text-emerald-400" },
          { label: "ADMINS", value: adminCount, color: "text-yellow-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
          >
            <div className="font-mono text-[9px] tracking-wider text-gray-600">
              {stat.label}
            </div>
            <div className={`mt-2 font-mono text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or email..."
          className="h-11 w-full max-w-sm rounded-lg border border-white/[0.08] bg-[#05080d] px-4 font-mono text-xs text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/40"
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 p-5">
          <div className="font-mono text-xs font-semibold text-red-400">ERROR</div>
          <p className="mt-2 font-mono text-xs leading-5 text-red-300/70">{error}</p>
        </div>
      )}

      {/* TABLE */}
      {!error && (
        <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
          <div className="grid grid-cols-[60px_1fr_1fr_80px_80px_100px] border-b border-white/[0.07] px-5 py-3">
            <div className="font-mono text-[9px] tracking-wider text-gray-600">ID</div>
            <div className="font-mono text-[9px] tracking-wider text-gray-600">USERNAME</div>
            <div className="font-mono text-[9px] tracking-wider text-gray-600">EMAIL</div>
            <div className="font-mono text-[9px] tracking-wider text-gray-600">ROLE</div>
            <div className="font-mono text-[9px] tracking-wider text-gray-600">LEVEL</div>
            <div className="text-right font-mono text-[9px] tracking-wider text-gray-600">POINTS</div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center font-mono text-sm text-gray-600">
              {users.length === 0 ? "No users found." : "No users match your search."}
            </div>
          ) : (
            filtered.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[60px_1fr_1fr_80px_80px_100px] items-center border-b border-white/[0.04] px-5 py-4 transition hover:bg-white/[0.025]"
              >
                <div className="font-mono text-xs text-gray-600">#{user.id}</div>

                <div className="font-mono text-xs font-medium text-white">
                  {user.username}
                </div>

                <div className="font-mono text-xs text-gray-400">{user.email}</div>

                <div>
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[9px] tracking-wider ${
                      user.role === "ADMIN"
                        ? "border-yellow-400/30 bg-yellow-400/5 text-yellow-400"
                        : "border-emerald-400/20 bg-emerald-400/5 text-emerald-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="font-mono text-xs text-gray-400">{user.level}</div>

                <div className="text-right font-mono text-xs font-bold text-emerald-400">
                  {user.points}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
