"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  points: number;
  level: number;
};

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-3 font-mono text-xs transition ${
        active
          ? "bg-emerald-400/10 text-emerald-400"
          : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300"
      }`}
    >
      <span>{icon}</span>
      {label}
    </Link>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [username, setUsername] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function logout() {
    localStorage.removeItem("cyberlab_user");
    localStorage.removeItem("cyberlab_token");
    router.replace("/login");
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("cyberlab_user");
    const token = localStorage.getItem("cyberlab_token");

    if (!storedUser || !token) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(storedUser) as User;
      setUser(parsed);
      setUsername(parsed.username);
    } catch {
      router.replace("/login");
      return;
    }

    setLoading(false);
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setProfileSaving(true);
    setProfileMsg(null);

    const token = localStorage.getItem("cyberlab_token");

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const updatedUser = { ...user, username: data.user.username };
        setUser(updatedUser);
        localStorage.setItem("cyberlab_user", JSON.stringify(updatedUser));
        setProfileMsg({ type: "success", text: "Profile updated successfully." });
      } else {
        setProfileMsg({ type: "error", text: data.message || "Update failed." });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Connection error. Please try again." });
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setPasswordSaving(true);

    const token = localStorage.getItem("cyberlab_token");

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordMsg({ type: "success", text: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "error", text: data.message || "Password change failed." });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Connection error. Please try again." });
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d] text-white">
        <div className="font-mono text-sm text-emerald-400">
          LOADING SETTINGS...
        </div>
    </div>
    );
  }

  if (!user) return null;

  return (
    <div className="w-full h-full">
      <section className="min-w-0 flex-1 px-5 py-7 lg:px-8">
          {/* HEADER */}
          <div className="mb-8">
            <div className="mb-1 font-mono text-[9px] tracking-[0.3em] text-emerald-400/70">
              CONFIGURATION
            </div>
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              Settings
            </h1>
            <p className="mt-1 font-mono text-xs text-gray-500">
              Manage your account preferences and security
            </p>
          </div>

          <div className="max-w-2xl space-y-6">
            {/* ACCOUNT INFO */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6">
              <div className="mb-5 font-mono text-xs font-bold tracking-wider text-gray-300">
                ⚙ ACCOUNT INFO
              </div>

              <div className="mb-4 rounded-lg border border-white/[0.05] bg-white/[0.02] p-4">
                <div className="mb-1 font-mono text-[9px] tracking-wider text-gray-600">EMAIL ADDRESS</div>
                <div className="font-mono text-sm text-gray-400">{user.email}</div>
                <div className="mt-1 font-mono text-[10px] text-gray-700">Email cannot be changed.</div>
              </div>

              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] tracking-wider text-gray-500">
                    USERNAME
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    minLength={3}
                    required
                    className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-4 font-mono text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20"
                  />
                </div>

                {profileMsg && (
                  <div
                    className={`rounded-lg border px-4 py-3 font-mono text-xs ${
                      profileMsg.type === "success"
                        ? "border-emerald-400/30 bg-emerald-400/5 text-emerald-400"
                        : "border-red-400/30 bg-red-400/5 text-red-400"
                    }`}
                  >
                    {profileMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="h-10 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-6 font-mono text-xs font-bold tracking-wider text-emerald-400 transition hover:bg-emerald-400/20 disabled:opacity-50"
                >
                  {profileSaving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </form>
            </div>

            {/* CHANGE PASSWORD */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6">
              <div className="mb-5 font-mono text-xs font-bold tracking-wider text-gray-300">
                🔒 CHANGE PASSWORD
              </div>

              <form onSubmit={savePassword} className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] tracking-wider text-gray-500">
                    CURRENT PASSWORD
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-4 font-mono text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] tracking-wider text-gray-500">
                    NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-4 font-mono text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] tracking-wider text-gray-500">
                    CONFIRM NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-4 font-mono text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20"
                  />
                </div>

                {passwordMsg && (
                  <div
                    className={`rounded-lg border px-4 py-3 font-mono text-xs ${
                      passwordMsg.type === "success"
                        ? "border-emerald-400/30 bg-emerald-400/5 text-emerald-400"
                        : "border-red-400/30 bg-red-400/5 text-red-400"
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.025] px-6 font-mono text-xs font-bold tracking-wider text-gray-300 transition hover:border-emerald-400/30 hover:text-emerald-400 disabled:opacity-50"
                >
                  {passwordSaving ? "UPDATING..." : "CHANGE PASSWORD"}
                </button>
              </form>
            </div>

            {/* DANGER ZONE */}
            <div className="rounded-xl border border-red-400/10 bg-red-400/[0.02] p-6">
              <div className="mb-3 font-mono text-xs font-bold tracking-wider text-red-400/70">
                ⚠ DANGER ZONE
              </div>
              <p className="mb-4 font-mono text-[10px] text-gray-600">
                Logging out will clear your session from this device.
              </p>
              <button
                onClick={logout}
                className="h-9 rounded-lg border border-red-400/30 bg-red-400/5 px-5 font-mono text-xs font-bold tracking-wider text-red-400 transition hover:bg-red-400/10"
              >
                SIGN OUT
              </button>
            </div>
          </div>
        </section>
    </div>
  );
}
