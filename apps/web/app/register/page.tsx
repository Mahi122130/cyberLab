"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type PasswordStrength = {
  label: string;
  score: number;
};

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      label: "",
      score: 0,
    };
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { label: "Weak", score };
  }

  if (score === 3) {
    return { label: "Fair", score };
  }

  if (score === 4) {
    return { label: "Strong", score };
  }

  return { label: "Excellent", score };
}

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password],
  );

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // ================================
    // FRONTEND VALIDATION
    // ================================

    if (cleanUsername.length < 3) {
      setError(
        "Username must contain at least 3 characters.",
      );
      return;
    }

    if (cleanUsername.length > 100) {
      setError(
        "Username cannot exceed 100 characters.",
      );
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      setError(
        "Username can only contain letters, numbers, underscores, dots and hyphens.",
      );
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (passwordStrength.score < 3) {
      setError(
        "Please choose a stronger password using uppercase, lowercase and numbers.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // ================================
    // API
    // ================================

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5001";

    setLoading(true);

    try {
      const response = await fetch(
        `${apiUrl}/users`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            username: cleanUsername,
            email: cleanEmail,
            password,
          }),
        },
      );

      const contentType =
        response.headers.get("content-type");

      let data: unknown = null;

      if (
        contentType?.includes(
          "application/json",
        )
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        data = {
          message: text,
        };
      }

      // ================================
      // API ERROR
      // ================================

      if (!response.ok) {
        let message =
          "Unable to create your account.";

        if (
          typeof data === "object" &&
          data !== null &&
          "message" in data
        ) {
          const apiMessage = (
            data as {
              message?: unknown;
            }
          ).message;

          if (Array.isArray(apiMessage)) {
            message = apiMessage
              .filter(
                (item) =>
                  typeof item === "string",
              )
              .join(", ");
          } else if (
            typeof apiMessage === "string"
          ) {
            message = apiMessage;
          }
        }

        throw new Error(message);
      }

      // ================================
      // SUCCESS
      // ================================

      console.log(
        "Registration successful:",
        data,
      );

      setSuccess(
        "Account created successfully! Redirecting to login...",
      );

      setPassword("");
      setConfirmPassword("");

      // =================================
      // REDIRECT TO LOGIN
      // =================================

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (err) {
      console.error(
        "Registration error:",
        err,
      );

      if (err instanceof TypeError) {
        setError(
          "Unable to connect to the CyberLab API. Please make sure the backend is running.",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080d] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-280px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-400/[0.07] blur-3xl" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      {/* HEADER */}
      <header className="relative border-b border-white/[0.08]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/10 font-mono text-sm font-bold text-emerald-400">
              &gt;_
            </div>

            <div>
              <div className="font-mono text-lg font-bold tracking-wider">
                CYBER
                <span className="text-emerald-400">
                  LAB
                </span>
              </div>

              <div className="font-mono text-[8px] tracking-[0.3em] text-gray-600">
                LEARN // PRACTICE // SECURE
              </div>
            </div>
          </Link>

          <div className="hidden font-mono text-[10px] tracking-[0.2em] text-gray-600 sm:block">
            SECURE REGISTRATION
          </div>
        </div>
      </header>

      {/* MAIN */}
      <section className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-12">
        <div className="grid w-full max-w-6xl gap-14 lg:grid-cols-[1fr_460px] lg:items-center">

          {/* LEFT */}
          <div className="hidden lg:block">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.04] px-4 py-2 font-mono text-[10px] tracking-[0.18em] text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              ACCESS // NEW OPERATIVE
            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
              Your lab.
              <br />
              Your skills.
              <br />
              <span className="text-emerald-400">
                Your mission.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-gray-500">
              Create your free CyberLab account and
              start building practical cybersecurity
              skills through hands-on challenges.
            </p>

            <div className="mt-10 space-y-4 font-mono text-xs">
              <div className="flex items-center gap-3 text-gray-500">
                <span className="text-emerald-400">
                  01
                </span>

                <span className="h-px w-8 bg-white/10" />

                Hands-on security labs
              </div>

              <div className="flex items-center gap-3 text-gray-500">
                <span className="text-emerald-400">
                  02
                </span>

                <span className="h-px w-8 bg-white/10" />

                Track your cybersecurity progress
              </div>

              <div className="flex items-center gap-3 text-gray-500">
                <span className="text-emerald-400">
                  03
                </span>

                <span className="h-px w-8 bg-white/10" />

                Build practical security skills
              </div>
            </div>
          </div>

          {/* CARD */}
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-emerald-400/20 via-white/[0.04] to-transparent" />

            <div className="relative rounded-2xl border border-white/[0.09] bg-[#0a1019]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">

              <div className="mb-7">
                <div className="mb-4 flex items-center justify-between">
                  <div className="font-mono text-[10px] tracking-[0.25em] text-emerald-400">
                    CREATE ACCOUNT
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[9px] text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    FREE
                  </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  Enter the lab.
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Create your account and begin your
                  cybersecurity journey.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* USERNAME */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block font-mono text-[10px] tracking-[0.16em] text-gray-500"
                  >
                    USERNAME
                  </label>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value,
                      )
                    }
                    placeholder="choose_username"
                    required
                    minLength={3}
                    maxLength={100}
                    disabled={loading}
                    className="h-12 w-full rounded-lg border border-white/[0.09] bg-black/20 px-4 font-mono text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/50"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block font-mono text-[10px] tracking-[0.16em] text-gray-500"
                  >
                    EMAIL ADDRESS
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    className="h-12 w-full rounded-lg border border-white/[0.09] bg-black/20 px-4 text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/50"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block font-mono text-[10px] tracking-[0.16em] text-gray-500"
                  >
                    PASSWORD
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value,
                        )
                      }
                      placeholder="••••••••••••"
                      required
                      minLength={8}
                      disabled={loading}
                      className="h-12 w-full rounded-lg border border-white/[0.09] bg-black/20 px-4 pr-20 text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-gray-600 hover:text-emerald-400"
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>

                  {password && (
                    <div className="mt-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(
                          (bar) => (
                            <div
                              key={bar}
                              className={`h-1 flex-1 rounded-full ${
                                bar <=
                                passwordStrength.score
                                  ? "bg-emerald-400"
                                  : "bg-white/10"
                              }`}
                            />
                          ),
                        )}
                      </div>

                      <div className="mt-2 flex justify-between font-mono text-[9px]">
                        <span className="text-gray-700">
                          MIN 8 CHARACTERS
                        </span>

                        <span className="text-gray-500">
                          {passwordStrength.label.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CONFIRM */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block font-mono text-[10px] tracking-[0.16em] text-gray-500"
                  >
                    CONFIRM PASSWORD
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value,
                        )
                      }
                      placeholder="••••••••••••"
                      required
                      disabled={loading}
                      className="h-12 w-full rounded-lg border border-white/[0.09] bg-black/20 px-4 pr-20 text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-gray-600 hover:text-emerald-400"
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div
                      className={`mt-2 font-mono text-[9px] ${
                        passwordsMatch
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {passwordsMatch
                        ? "[+] PASSWORDS MATCH"
                        : "[!] PASSWORDS DO NOT MATCH"}
                    </div>
                  )}
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-lg border border-red-400/20 bg-red-400/[0.04] px-4 py-3 font-mono text-xs text-red-300">
                    <span className="mr-2 text-red-400">
                      !
                    </span>
                    {error}
                  </div>
                )}

                {/* SUCCESS */}
                {success && (
                  <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] px-4 py-3 font-mono text-xs text-emerald-300">
                    <span className="mr-2 text-emerald-400">
                      ✓
                    </span>
                    {success}
                  </div>
                )}

                <p className="text-[11px] leading-5 text-gray-600">
                  By creating an account, you agree to
                  use CyberLab only for authorized
                  learning and security testing.
                </p>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-emerald-400 font-mono text-xs font-semibold tracking-wide text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "INITIALIZING..."
                    : "CREATE FREE ACCOUNT →"}
                </button>
              </form>

              {/* LOGIN LINK */}
              <div className="mt-7 border-t border-white/[0.07] pt-6 text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?
                </span>{" "}

                <Link
                  href="/login"
                  className="font-mono text-xs text-emerald-400 hover:text-emerald-300"
                >
                  LOG IN →
                </Link>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 font-mono text-[9px] tracking-[0.15em] text-gray-700">
              <span className="text-emerald-400">
                ◆
              </span>
              CYBERLAB // SECURE ACCESS NODE
              <span className="text-emerald-400">
                ◆
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}