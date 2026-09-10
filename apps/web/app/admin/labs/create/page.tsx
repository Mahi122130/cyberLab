
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type LabForm = {
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: string;
  targetType: "WEB" | "LINUX" | "NETWORK" | "CRYPTO";
  targetUrl: string;
  dockerImage: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function CreateLabPage() {
  const [form, setForm] = useState<LabForm>({
    title: "",
    slug: "",
    description: "",
    category: "",
    difficulty: "EASY",
    points: "100",
    targetType: "WEB",
    targetUrl: "",
    dockerImage: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(
    field: keyof LabForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: generateSlug(value),
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const points = Number(form.points);

      if (!form.title.trim()) {
        throw new Error("Lab title is required.");
      }

      if (!form.slug.trim()) {
        throw new Error("Lab slug is required.");
      }

      if (!form.description.trim()) {
        throw new Error("Lab description is required.");
      }

      if (!form.category) {
        throw new Error("Please select a category.");
      }

      if (!Number.isInteger(points) || points < 0) {
        throw new Error(
          "Points must be a valid non-negative number.",
        );
      }

      const response = await fetch(`${API_URL}/labs`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          category: form.category,
          difficulty: form.difficulty,
          points,
          target_type: form.targetType,
          target_url: form.targetUrl.trim() || null,
          docker_image:
            form.dockerImage.trim() || null,
        }),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const serverMessage =
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message;

        throw new Error(
          serverMessage ||
            `Failed to create lab. HTTP ${response.status}`,
        );
      }

      setMessage(
        data?.message ||
          "Lab created successfully.",
      );

      setForm({
        title: "",
        slug: "",
        description: "",
        category: "",
        difficulty: "EASY",
        points: "100",
        targetType: "WEB",
        targetUrl: "",
        dockerImage: "",
      });
    } catch (err) {
      if (
        err instanceof TypeError &&
        err.message === "Failed to fetch"
      ) {
        setError(
          "Cannot connect to the CyberLab API. Make sure NestJS is running on http://localhost:5001.",
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      {/* HEADER */}
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
            <span className="font-mono text-[10px] text-emerald-400">
              ADMIN
            </span>

            <Link
              href="/admin"
              className="font-mono text-xs text-gray-500 transition hover:text-emerald-400"
            >
              ← ADMIN DASHBOARD
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-[1100px] px-5 py-10 lg:px-8">
        {/* BREADCRUMB */}
        <div className="mb-8 font-mono text-[9px] tracking-[0.18em] text-gray-600">
          CYBERLAB / ADMIN / LABS / CREATE
        </div>

        {/* PAGE HEADER */}
        <div className="mb-8">
          <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
            LAB MANAGEMENT
          </div>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Create Lab
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
            Create a cybersecurity laboratory and configure
            its target environment.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* BASIC INFORMATION */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">
              <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                01 / BASIC INFORMATION
              </div>

              <div className="mt-6 grid gap-6">
                <Field
                  label="LAB TITLE"
                  required
                >
                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      handleTitleChange(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. The Forgotten Admin"
                    required
                    className="input"
                  />
                </Field>

                <Field
                  label="SLUG"
                  required
                >
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(event) =>
                      updateField(
                        "slug",
                        event.target.value,
                      )
                    }
                    placeholder="the-forgotten-admin"
                    required
                    className="input font-mono"
                  />

                  <p className="help">
                    Unique identifier used by the API.
                  </p>
                </Field>

                <Field
                  label="DESCRIPTION"
                  required
                >
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Describe the scenario students will investigate..."
                    required
                    rows={5}
                    className="input resize-none"
                  />
                </Field>
              </div>
            </section>

            {/* CONFIGURATION */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">
              <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                02 / LAB CONFIGURATION
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Field
                  label="CATEGORY"
                  required
                >
                  <select
                    value={form.category}
                    onChange={(event) =>
                      updateField(
                        "category",
                        event.target.value,
                      )
                    }
                    required
                    className="input"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Select category
                    </option>

                    <option value="Web Security">
                      Web Security
                    </option>

                    <option value="Linux">
                      Linux
                    </option>

                    <option value="Networking">
                      Networking
                    </option>

                    <option value="Cryptography">
                      Cryptography
                    </option>

                    <option value="Forensics">
                      Forensics
                    </option>

                    <option value="Reverse Engineering">
                      Reverse Engineering
                    </option>

                    <option value="OSINT">
                      OSINT
                    </option>
                  </select>
                </Field>

                <Field
                  label="DIFFICULTY"
                  required
                >
                  <select
                    value={form.difficulty}
                    onChange={(event) =>
                      updateField(
                        "difficulty",
                        event.target.value,
                      )
                    }
                    className="input"
                  >
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
                </Field>

                <Field
                  label="TOTAL XP"
                  required
                >
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.points}
                    onChange={(event) =>
                      updateField(
                        "points",
                        event.target.value,
                      )
                    }
                    required
                    className="input"
                  />

                  <p className="help">
                    XP awarded after completing the lab.
                  </p>
                </Field>

                <Field
                  label="TARGET TYPE"
                  required
                >
                  <select
                    value={form.targetType}
                    onChange={(event) =>
                      updateField(
                        "targetType",
                        event.target.value,
                      )
                    }
                    className="input"
                  >
                    <option value="WEB">
                      Web Application
                    </option>

                    <option value="LINUX">
                      Linux Machine
                    </option>

                    <option value="NETWORK">
                      Network
                    </option>

                    <option value="CRYPTO">
                      Cryptography
                    </option>
                  </select>
                </Field>
              </div>
            </section>

            {/* TARGET ENVIRONMENT */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">
              <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                03 / TARGET ENVIRONMENT
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Configure the environment students will
                interact with. Docker can later be used to
                provision isolated targets.
              </p>

              <div className="mt-6 grid gap-6">
                <Field label="TARGET URL">
                  <input
                    type="url"
                    value={form.targetUrl}
                    onChange={(event) =>
                      updateField(
                        "targetUrl",
                        event.target.value,
                      )
                    }
                    placeholder="http://localhost:8080"
                    className="input font-mono"
                  />

                  <p className="help">
                    Optional. Leave empty for dynamically
                    provisioned targets.
                  </p>
                </Field>

                <Field label="DOCKER IMAGE">
                  <input
                    type="text"
                    value={form.dockerImage}
                    onChange={(event) =>
                      updateField(
                        "dockerImage",
                        event.target.value,
                      )
                    }
                    placeholder="cyberlab/forgotten-admin:latest"
                    className="input font-mono"
                  />

                  <p className="help">
                    Optional Docker image for the target.
                  </p>
                </Field>
              </div>
            </section>

            {/* PREVIEW */}
            <section className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.02] p-6 sm:p-8">
              <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
                LAB PREVIEW
              </div>

              <div className="mt-5 rounded-xl border border-white/[0.07] bg-[#0a1019] p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <div className="font-mono text-[9px] tracking-wider text-gray-600">
                      {form.category ||
                        "CATEGORY"}
                    </div>

                    <h2 className="mt-2 text-xl font-semibold">
                      {form.title ||
                        "Your Lab Title"}
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                      {form.description ||
                        "Your lab description will appear here."}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <div
                      className={`font-mono text-xs ${
                        form.difficulty ===
                        "EASY"
                          ? "text-emerald-400"
                          : form.difficulty ===
                              "MEDIUM"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {form.difficulty}
                    </div>

                    <div className="mt-2 font-mono text-xs text-gray-600">
                      +{form.points || "0"} XP
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SUCCESS */}
            {message && (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4 font-mono text-xs text-emerald-400">
                ✓ {message}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 font-mono text-xs leading-6 text-red-400">
                ✕ {error}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/admin/labs"
                className="flex h-12 items-center justify-center rounded-lg border border-white/[0.08] px-6 font-mono text-xs text-gray-500 transition hover:border-white/[0.15] hover:text-white"
              >
                CANCEL
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-lg bg-emerald-400 px-8 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "CREATING..."
                  : "CREATE LAB →"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-mono text-[9px] tracking-[0.15em] text-gray-500">
        {label}

        {required && (
          <span className="ml-1 text-emerald-400">
            *
          </span>
        )}
      </label>

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}
