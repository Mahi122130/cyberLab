
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Lab = {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  target_type: "WEB" | "LINUX" | "NETWORK" | "CRYPTO";
  target_url: string | null;
  docker_image: string | null;
  is_active: number;
  created_at: string;
};

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
  isActive: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

export default function EditLabPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;

  const id = Array.isArray(rawId)
    ? rawId[0]
    : rawId;

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
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // LOAD LAB
  // =========================================================

  useEffect(() => {
    if (!id) {
      setError("Lab ID is missing.");
      setLoading(false);
      return;
    }

    async function loadLab() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/labs/${id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        let data: any = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            Array.isArray(data?.message)
              ? data.message.join(", ")
              : data?.message ||
                  `Failed to load lab. HTTP ${response.status}`,
          );
        }

        /*
         * Your API returns the lab directly:
         *
         * {
         *   id: 1,
         *   title: "...",
         *   ...
         * }
         */

        const lab: Lab =
          data?.lab ?? data;

        if (!lab?.id) {
          throw new Error(
            "Invalid lab response from API.",
          );
        }

        setForm({
          title: lab.title ?? "",
          slug: lab.slug ?? "",
          description:
            lab.description ?? "",
          category: lab.category ?? "",
          difficulty:
            lab.difficulty ?? "EASY",
          points: String(
            lab.points ?? 0,
          ),
          targetType:
            lab.target_type ?? "WEB",
          targetUrl:
            lab.target_url ?? "",
          dockerImage:
            lab.docker_image ?? "",
          isActive:
            Boolean(lab.is_active),
        });
      } catch (err) {
        if (
          err instanceof TypeError &&
          err.message === "Failed to fetch"
        ) {
          setError(
            `Cannot connect to the CyberLab API at ${API_URL}. Make sure NestJS is running.`,
          );
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load lab.",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadLab();
  }, [id]);

  // =========================================================
  // UPDATE FIELD
  // =========================================================

  function updateField(
    field: keyof LabForm,
    value:
      | string
      | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!id) {
      setError("Lab ID is missing.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const points = Number(
        form.points,
      );

      if (!form.title.trim()) {
        throw new Error(
          "Lab title is required.",
        );
      }

      if (!form.slug.trim()) {
        throw new Error(
          "Lab slug is required.",
        );
      }

      if (!form.description.trim()) {
        throw new Error(
          "Lab description is required.",
        );
      }

      if (!form.category) {
        throw new Error(
          "Please select a category.",
        );
      }

      if (
        !Number.isInteger(points) ||
        points < 0
      ) {
        throw new Error(
          "Points must be a valid non-negative number.",
        );
      }

      const response = await fetch(
        `${API_URL}/labs/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            title: form.title.trim(),
            slug: form.slug.trim(),
            description:
              form.description.trim(),
            category: form.category,
            difficulty:
              form.difficulty,
            points,
            target_type:
              form.targetType,
            target_url:
              form.targetUrl.trim() ||
              null,
            docker_image:
              form.dockerImage.trim() ||
              null,
            is_active:
              form.isActive,
          }),
        },
      );

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
            `Failed to update lab. HTTP ${response.status}`,
        );
      }

      setMessage(
        data?.message ||
          "Lab updated successfully.",
      );

      // Give the user a moment to see success.
      setTimeout(() => {
        router.push(
          `/admin/labs/${id}`,
        );
        router.refresh();
      }, 700);
    } catch (err) {
      if (
        err instanceof TypeError &&
        err.message === "Failed to fetch"
      ) {
        setError(
          `Cannot connect to the CyberLab API at ${API_URL}.`,
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080d] text-white">
        <header className="border-b border-white/[0.07]">
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

            <span className="font-mono text-[10px] text-emerald-400">
              ADMIN
            </span>
          </div>
        </header>

        <section className="mx-auto max-w-[1100px] px-5 py-16 lg:px-8">
          <div className="font-mono text-xs text-gray-500">
            LOADING LAB...
          </div>
        </section>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !form.title) {
    return (
      <div className="min-h-screen bg-[#05080d] text-white">
        <header className="border-b border-white/[0.07]">
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

            <span className="font-mono text-[10px] text-emerald-400">
              ADMIN
            </span>
          </div>
        </header>

        <section className="mx-auto max-w-[900px] px-5 py-16 lg:px-8">
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-8">
            <div className="font-mono text-[9px] tracking-[0.2em] text-red-400">
              LAB ERROR
            </div>

            <h1 className="mt-3 text-2xl font-bold">
              Unable to load lab
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {error}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  router.back()
                }
                className="rounded-lg border border-white/[0.08] px-5 py-3 font-mono text-xs text-gray-400 hover:text-white"
              >
                ← GO BACK
              </button>

              <Link
                href="/admin/labs"
                className="rounded-lg bg-emerald-400 px-5 py-3 font-mono text-xs font-semibold text-black"
              >
                ALL LABS
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#05080d] text-white">
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
              href={`/admin/labs/${id}`}
              className="font-mono text-xs text-gray-500 hover:text-emerald-400"
            >
              ← LAB DETAILS
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-[1100px] px-5 py-10 lg:px-8">
        {/* BREADCRUMB */}
        <div className="mb-8 font-mono text-[9px] tracking-[0.18em] text-gray-600">
          CYBERLAB / ADMIN / LABS / {id} / EDIT
        </div>

        {/* HEADER */}
        <div className="mb-8">
          <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
            LAB MANAGEMENT
          </div>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Edit Lab
          </h1>

          <p className="mt-3 text-sm leading-7 text-gray-500">
            Update the lab configuration,
            target environment, and
            activation status.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
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
                    updateField(
                      "title",
                      event.target.value,
                    )
                  }
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
                  required
                  className="input font-mono"
                />

                <p className="help">
                  The slug must remain unique.
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
                  required
                  rows={6}
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
                  <option value="">
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
                      event.target
                        .value as LabForm["difficulty"],
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
                      event.target
                        .value as LabForm["targetType"],
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

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Configure the target students
              will interact with.
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
                  placeholder="cyberlab/target:latest"
                  className="input font-mono"
                />
              </Field>
            </div>
          </section>

          {/* STATUS */}
          <section className="rounded-2xl border border-white/[0.07] bg-[#0a1019] p-6 sm:p-8">
            <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-400">
              04 / LAB STATUS
            </div>

            <div className="mt-6 flex items-center justify-between gap-6">
              <div>
                <div className="text-sm font-medium">
                  Lab availability
                </div>

                <p className="mt-1 text-xs text-gray-600">
                  Inactive labs can remain in
                  the admin system without
                  being available to students.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateField(
                    "isActive",
                    !form.isActive,
                  )
                }
                className={`relative h-7 w-12 rounded-full transition ${
                  form.isActive
                    ? "bg-emerald-400"
                    : "bg-gray-700"
                }`}
                aria-label={
                  form.isActive
                    ? "Deactivate lab"
                    : "Activate lab"
                }
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    form.isActive
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 font-mono text-[10px]">
              {form.isActive ? (
                <span className="text-emerald-400">
                  ● ACTIVE
                </span>
              ) : (
                <span className="text-red-400">
                  ● INACTIVE
                </span>
              )}
            </div>
          </section>

          {/* MESSAGE */}
          {message && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4 font-mono text-xs text-emerald-400">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 font-mono text-xs leading-6 text-red-400">
              ✕ {error}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/admin/labs/${id}`}
              className="flex h-12 items-center justify-center rounded-lg border border-white/[0.08] px-6 font-mono text-xs text-gray-500 hover:border-white/[0.15] hover:text-white"
            >
              CANCEL
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="h-12 rounded-lg bg-emerald-400 px-8 font-mono text-xs font-semibold text-black hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "SAVING..."
                : "SAVE CHANGES →"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

// =========================================================
// FIELD COMPONENT
// =========================================================

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
