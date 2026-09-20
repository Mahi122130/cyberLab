"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoggedInUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  points: number;
  level: number;
  created_at?: string;
};

type LoginResponse = {
  success?: boolean;
  message?: string;
  user?: LoggedInUser;

  // Backend returns accessToken
  accessToken?: string;

  // Keep these for compatibility
  access_token?: string;
  token?: string;
};

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    const identifier = usernameOrEmail.trim();

    if (!identifier) {
      setError("Please enter your username or email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    /*
    |--------------------------------------------------------------------------
    | API CONFIGURATION
    |--------------------------------------------------------------------------
    |
    | .env.local:
    |
    | NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
    |
    | NestJS:
    |
    | POST /api/v1/auth/login
    |
    */

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5001/api/v1";

    const loginUrl = `${apiUrl}/auth/login`;

    try {
      console.log(
        "CyberLab login request:",
        loginUrl,
      );

      /*
      |--------------------------------------------------------------------------
      | LOGIN REQUEST
      |--------------------------------------------------------------------------
      */

      const response = await fetch(loginUrl, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          email: identifier,
          password,
        }),
      });

      /*
      |--------------------------------------------------------------------------
      | READ RESPONSE
      |--------------------------------------------------------------------------
      */

      const contentType =
        response.headers.get("content-type");

      let data: LoginResponse = {};

      if (
        contentType?.toLowerCase().includes(
          "application/json",
        )
      ) {
        data =
          (await response.json()) as LoginResponse;
      } else {
        const text = await response.text();

        data = {
          message: text,
        };
      }

      console.log(
        "CyberLab login response:",
        response.status,
        data,
      );

      /*
      |--------------------------------------------------------------------------
      | HANDLE API ERROR
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        let message = "Login failed.";

        if (Array.isArray(data.message)) {
          message = data.message.join(", ");
        } else if (
          data.message &&
          typeof data.message === "string"
        ) {
          message = data.message;
        }

        throw new Error(message);
      }

      /*
      |--------------------------------------------------------------------------
      | CHECK USER
      |--------------------------------------------------------------------------
      */

      if (!data.user) {
        throw new Error(
          "Login succeeded, but the server did not return user information.",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SAVE USER
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        "cyberlab_user",
        JSON.stringify(data.user),
      );

      /*
      |--------------------------------------------------------------------------
      | SAVE ACCESS TOKEN
      |--------------------------------------------------------------------------
      |
      | Backend returns:
      |
      | accessToken
      |
      | We also support access_token and token
      | for compatibility.
      |
      */

      const token =
        data.accessToken ||
        data.access_token ||
        data.token;

      if (
        token &&
        typeof token === "string"
      ) {
        localStorage.setItem(
          "cyberlab_token",
          token,
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      console.log(
        "CyberLab login successful:",
        data.user,
      );

      console.log(
        "CyberLab user role:",
        data.user.role,
      );

      setSuccess(
        `Welcome back, ${data.user.username}. Entering CyberLab...`,
      );

      /*
      |--------------------------------------------------------------------------
      | CLEAR {t.password}
      |--------------------------------------------------------------------------
      */

      setPassword("");

      /*
      |--------------------------------------------------------------------------
      | REDIRECT
      |--------------------------------------------------------------------------
      |
      | ADMIN  -> /admin
      | STUDENT -> /dashboard
      |
      */

      setTimeout(() => {
        if (data.user?.role === "ADMIN") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      }, 700);
    } catch (err) {
      console.error(
        "CyberLab login error:",
        err,
      );

      /*
      |--------------------------------------------------------------------------
      | NETWORK ERROR
      |--------------------------------------------------------------------------
      */

      if (err instanceof TypeError) {
        setError(
          "Unable to connect to the CyberLab API. Please make sure the backend is running on http://localhost:5001.",
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
            {t.secureLogin}
          </div>

        </div>

      </header>

      {/* MAIN */}

      <section className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-12">

        <div className="grid w-full max-w-6xl gap-14 lg:grid-cols-[1fr_460px] lg:items-center">

          {/* LEFT SIDE */}

          <div className="hidden lg:block">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.04] px-4 py-2 font-mono text-[10px] tracking-[0.18em] text-emerald-400">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

              {t.accessOperativeLogin}

            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">

              Welcome

              <br />

              <span className="text-emerald-400">
                back.
              </span>

            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-gray-500">
              Sign in to continue your CyberLab
              journey and access your cybersecurity
              training environment.
            </p>

            <div className="mt-10 space-y-4 font-mono text-xs">

              <div className="flex items-center gap-3 text-gray-500">

                <span className="text-emerald-400">
                  01
                </span>

                <span className="h-px w-8 bg-white/10" />

                {t.continueTraining}

              </div>

              <div className="flex items-center gap-3 text-gray-500">

                <span className="text-emerald-400">
                  02
                </span>

                <span className="h-px w-8 bg-white/10" />

                {t.accessSecurityLabs}

              </div>

              <div className="flex items-center gap-3 text-gray-500">

                <span className="text-emerald-400">
                  03
                </span>

                <span className="h-px w-8 bg-white/10" />

                {t.trackProgress}

              </div>

            </div>

          </div>

          {/* LOGIN CARD */}

          <div className="relative">

            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-emerald-400/20 via-white/[0.04] to-transparent" />

            <div className="relative rounded-2xl border border-white/[0.09] bg-[#0a1019]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">

              {/* CARD HEADER */}

              <div className="mb-7">

                <div className="mb-4 flex items-center justify-between">

                  <div className="font-mono text-[10px] tracking-[0.25em] text-emerald-400">
                    {t.loginAuthenticate}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[9px] text-gray-600">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    SECURE

                  </div>

                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  Welcome back.
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Enter your credentials to access
                  CyberLab.
                </p>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* USERNAME / EMAIL */}

                <div>

                  <label
                    htmlFor="usernameOrEmail"
                    className="mb-2 block font-mono text-[10px] tracking-[0.16em] text-gray-500"
                  >
                    {t.usernameOrEmail}
                  </label>

                  <input
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    type="text"
                    autoComplete="username"
                    value={usernameOrEmail}
                    onChange={(e) =>
                      setUsernameOrEmail(
                        e.target.value,
                      )
                    }
                    placeholder="username or email"
                    required
                    disabled={loading}
                    className="h-12 w-full rounded-lg border border-white/[0.09] bg-black/20 px-4 font-mono text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/50 disabled:opacity-50"
                  />

                </div>

                {/* {t.password} */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block font-mono text-[10px] tracking-[0.16em] text-gray-500"
                  >
                    {t.password}
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
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value,
                        )
                      }
                      placeholder="••••••••••••"
                      required
                      disabled={loading}
                      className="h-12 w-full rounded-lg border border-white/[0.09] bg-black/20 px-4 pr-20 text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-400/50 disabled:opacity-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value,
                        )
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-wider text-gray-600 hover:text-emerald-400 disabled:opacity-50"
                    >
                      {showPassword
                        ? t.hide
                        : t.show}
                    </button>

                  </div>

                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-lg border border-red-400/20 bg-red-400/[0.04] px-4 py-3 font-mono text-xs leading-5 text-red-300">

                    <span className="mr-2 text-red-400">
                      !
                    </span>

                    {error}

                  </div>
                )}

                {/* SUCCESS */}

                {success && (
                  <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] px-4 py-3 font-mono text-xs leading-5 text-emerald-300">

                    <span className="mr-2 text-emerald-400">
                      ✓
                    </span>

                    {success}

                  </div>
                )}

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-emerald-400 font-mono text-xs font-semibold tracking-wide text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? t.authenticating
                    : t.enterCyberlab}
                </button>

              </form>

              {/* REGISTER */}

              <div className="mt-7 border-t border-white/[0.07] pt-6 text-center">

                <span className="text-sm text-gray-600">
                  {t.noAccount}
                </span>{" "}

                <Link
                  href="/register"
                  className="font-mono text-xs text-emerald-400 transition hover:text-emerald-300"
                >
                  {t.createAccount}
                </Link>

              </div>

            </div>

            {/* SECURITY */}

            <div className="mt-5 flex items-center justify-center gap-2 font-mono text-[9px] tracking-[0.15em] text-gray-700">

              <span className="text-emerald-400">
                ◆
              </span>

              {t.secureAccessNode}

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
