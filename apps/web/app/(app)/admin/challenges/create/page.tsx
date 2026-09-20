"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1";

type Lab = {
  id: number;
  title: string;
  slug: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  is_active: boolean | number;
};

type ChallengeForm = {
  lab_id: string;
  title: string;
  description: string;
  task: string;
  flag: string;
  points: string;
  order_number: string;
  is_active: boolean;
  hints: { hint_text: string; hint_order: number }[];
};

export default function CreateChallengePage() {
  const router = useRouter();

  const [labs, setLabs] = useState<Lab[]>([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] =
    useState<ChallengeForm>({
      lab_id: "",
      title: "",
      description: "",
      task: "",
      flag: "",
      points: "100",
      order_number: "1",
      is_active: true,
      hints: [],
    });

  function addHint() {
    setForm((prev) => ({
      ...prev,
      hints: [...prev.hints, { hint_text: "", hint_order: prev.hints.length + 1 }],
    }));
  }

  function updateHint(index: number, text: string) {
    setForm((prev) => {
      const newHints = [...prev.hints];
      newHints[index].hint_text = text;
      return { ...prev, hints: newHints };
    });
  }

  function removeHint(index: number) {
    setForm((prev) => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index),
    }));
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD LABS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadLabs() {
      try {
        setLoadingLabs(true);
        setError("");

        const response = await fetch(
          `${API_URL}/labs`,
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load labs.",
          );
        }

        const data = await response.json();

        const labList = Array.isArray(data)
          ? data
          : data?.labs ||
            data?.data ||
            [];

        setLabs(labList);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load labs.",
        );
      } finally {
        setLoadingLabs(false);
      }
    }

    loadLabs();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | UPDATE FORM FIELD
  |--------------------------------------------------------------------------
  */

  function updateField(
    field: keyof ChallengeForm,
    value: string | boolean,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    /*
     * Basic validation
     */

    if (!form.lab_id) {
      setError(
        "Please select a lab.",
      );
      return;
    }

    if (!form.title.trim()) {
      setError(
        "Challenge title is required.",
      );
      return;
    }

    if (!form.description.trim()) {
      setError(
        "Challenge description is required.",
      );
      return;
    }

    if (!form.task.trim()) {
      setError(
        "Challenge task is required.",
      );
      return;
    }

    if (!form.flag.trim()) {
      setError(
        "Challenge flag is required.",
      );
      return;
    }

    const points = Number(
      form.points,
    );

    if (
      !Number.isInteger(points) ||
      points < 0
    ) {
      setError(
        "Points must be a valid non-negative number.",
      );
      return;
    }

    const orderNumber = Number(
      form.order_number,
    );

    if (
      !Number.isInteger(orderNumber) ||
      orderNumber < 1
    ) {
      setError(
        "Order number must be a valid positive number.",
      );
      return;
    }

    const labId = Number(
      form.lab_id,
    );

    if (
      !Number.isInteger(labId) ||
      labId <= 0
    ) {
      setError(
        "Please select a valid lab.",
      );
      return;
    }

    try {
      setSubmitting(true);

      /*
       * POST /labs/:labId/challenges
       */

      const response = await fetch(
        `${API_URL}/labs/${labId}/challenges`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: form.title.trim(),

            description:
              form.description.trim(),

            task: form.task.trim(),

            /*
             * IMPORTANT:
             * This is the new flag field
             * supported by LabsService.
             */
            flag: form.flag.trim(),

            points,

            order_number:
              orderNumber,

            is_active:
              form.is_active,

            hints: form.hints.filter(h => h.hint_text.trim() !== ""),
          }),
        },
      );

      let data: any = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const serverMessage =
          Array.isArray(
            data?.message,
          )
            ? data.message.join(", ")
            : data?.message;

        throw new Error(
          serverMessage ||
            data?.error ||
            `Failed to create challenge. HTTP ${response.status}`,
        );
      }

      setSuccess(
        data?.message ||
          "Challenge created successfully!",
      );

      /*
       * Reset form.
       */

      setForm({
        lab_id: "",
        title: "",
        description: "",
        task: "",
        flag: "",
        points: "100",
        order_number: "1",
        is_active: true,
        hints: [],
      });

      /*
       * Return to challenge management.
       */

      setTimeout(() => {
        router.push(
          "/admin/challenges",
        );
      }, 1000);
    } catch (err) {
      console.error(err);

      if (
        err instanceof TypeError &&
        err.message ===
          "Failed to fetch"
      ) {
        setError(
          "Cannot connect to the CyberLab API. Make sure NestJS is running on http://localhost:5001.",
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create challenge.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#070b12] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/challenges",
              )
            }
            className="mb-4 text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Challenges
          </button>

          <h1 className="text-3xl font-bold">
            Create Challenge
          </h1>

          <p className="mt-2 text-gray-400">
            Create a new cybersecurity
            challenge for one of your
            labs.
          </p>
        </div>

        {/* ========================================================= */}
        {/* ALERTS */}
        {/* ========================================================= */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {success}
          </div>
        )}

        {/* ========================================================= */}
        {/* FORM */}
        {/* ========================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-[#0d131d] p-6 shadow-xl"
        >
          {/* ======================================================= */}
          {/* LAB */}
          {/* ======================================================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Lab
              <span className="ml-1 text-red-400">
                *
              </span>
            </label>

            <select
              value={form.lab_id}
              onChange={(event) =>
                updateField(
                  "lab_id",
                  event.target.value,
                )
              }
              disabled={
                loadingLabs ||
                submitting
              }
              required
              className="w-full rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white outline-none transition focus:border-cyan-500"
            >
              <option value="">
                {loadingLabs
                  ? "Loading labs..."
                  : "Select a lab"}
              </option>

              {labs
                .filter(
                  (lab) =>
                    lab.is_active ===
                      true ||
                    lab.is_active ===
                      1,
                )
                .map((lab) => (
                  <option
                    key={lab.id}
                    value={lab.id}
                  >
                    {lab.title} —{" "}
                    {lab.difficulty}
                  </option>
                ))}
            </select>
          </div>

          {/* ======================================================= */}
          {/* TITLE */}
          {/* ======================================================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Challenge Title
              <span className="ml-1 text-red-400">
                *
              </span>
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value,
                )
              }
              placeholder="Example: IDOR - Profile Access"
              disabled={submitting}
              required
              className="w-full rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* ======================================================= */}
          {/* DESCRIPTION */}
          {/* ======================================================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Description
              <span className="ml-1 text-red-400">
                *
              </span>
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              placeholder="Explain the scenario and background of the challenge."
              rows={4}
              disabled={submitting}
              required
              className="w-full resize-none rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* ======================================================= */}
          {/* TASK */}
          {/* ======================================================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Task
              <span className="ml-1 text-red-400">
                *
              </span>
            </label>

            <textarea
              value={form.task}
              onChange={(event) =>
                updateField(
                  "task",
                  event.target.value,
                )
              }
              placeholder="Tell the student what they need to accomplish."
              rows={5}
              disabled={submitting}
              required
              className="w-full resize-none rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* ======================================================= */}
          {/* FLAG */}
          {/* ======================================================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Flag
              <span className="ml-1 text-red-400">
                *
              </span>
            </label>

            <input
              type="text"
              value={form.flag}
              onChange={(event) =>
                updateField(
                  "flag",
                  event.target.value,
                )
              }
              placeholder="CYBERLAB{idor_profile_access_2026}"
              disabled={submitting}
              required
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-emerald-500/20 bg-[#080d15] px-4 py-3 font-mono text-sm text-emerald-300 placeholder-gray-600 outline-none transition focus:border-emerald-400"
            />

            <p className="mt-2 text-xs leading-5 text-gray-500">
              The secret answer students must
              submit to complete this challenge.
              The flag is stored in the database
              and is not returned by the student
              challenge API.
            </p>
          </div>

          {/* ======================================================= */}
          {/* POINTS + ORDER */}
          {/* ======================================================= */}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Points
                <span className="ml-1 text-red-400">
                  *
                </span>
              </label>

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
                disabled={submitting}
                required
                className="w-full rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white outline-none transition focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Order Number
                <span className="ml-1 text-red-400">
                  *
                </span>
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={
                  form.order_number
                }
                onChange={(event) =>
                  updateField(
                    "order_number",
                    event.target.value,
                  )
                }
                disabled={submitting}
                required
                className="w-full rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white outline-none transition focus:border-cyan-500"
              />

              <p className="mt-2 text-xs text-gray-500">
                Controls the order in which
                challenges appear inside the
                lab.
              </p>
            </div>
          </div>

          {/* ======================================================= */}
          {/* ACTIVE */}
          {/* ======================================================= */}

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#080d15] px-4 py-4">
            <div>
              <p className="font-medium text-white">
                Active Challenge
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Students can see this challenge
                when it is active.
              </p>
            </div>

            <button
              type="button"
              aria-label={
                form.is_active
                  ? "Deactivate challenge"
                  : "Activate challenge"
              }
              onClick={() =>
                updateField(
                  "is_active",
                  !form.is_active,
                )
              }
              disabled={submitting}
              className={`relative h-6 w-11 rounded-full transition ${
                form.is_active
                  ? "bg-cyan-500"
                  : "bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  form.is_active
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* ======================================================= */}
          {/* HINTS */}
          {/* ======================================================= */}

          <div className="rounded-lg border border-white/10 bg-[#080d15] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">
                  Hints
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Provide clues to help students solve this challenge.
                </p>
              </div>
              <button
                type="button"
                onClick={addHint}
                disabled={submitting}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                + Add Hint
              </button>
            </div>

            {form.hints.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
                No hints added yet. Click "Add Hint" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {form.hints.map((hint, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0d131d] font-mono text-sm text-gray-400">
                      #{index + 1}
                    </div>
                    <textarea
                      value={hint.hint_text}
                      onChange={(e) => updateHint(index, e.target.value)}
                      placeholder="Enter hint text here..."
                      rows={2}
                      disabled={submitting}
                      className="w-full resize-none rounded-lg border border-white/10 bg-[#0d131d] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeHint(index)}
                      disabled={submitting}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                      title="Remove Hint"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* CHALLENGE PREVIEW */}
          {/* ======================================================= */}

          <div className="rounded-xl border border-white/10 bg-[#080d15] p-5">
            <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Challenge Preview
            </div>

            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <div className="text-xs uppercase tracking-wider text-cyan-400">
                  {form.lab_id
                    ? labs.find(
                        (lab) =>
                          lab.id ===
                          Number(
                            form.lab_id,
                          ),
                      )?.title ||
                      "Selected Lab"
                    : "No Lab Selected"}
                </div>

                <h2 className="mt-2 text-xl font-semibold text-white">
                  {form.title ||
                    "Challenge Title"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {form.description ||
                    "Challenge description will appear here."}
                </p>
              </div>

              <div className="shrink-0">
                <div className="font-mono text-xs text-cyan-400">
                  +{form.points || "0"} XP
                </div>

                <div className="mt-2 font-mono text-xs text-gray-600">
                  #{form.order_number ||
                    "1"}
                </div>

                <div
                  className={`mt-2 font-mono text-xs ${
                    form.is_active
                      ? "text-emerald-400"
                      : "text-gray-600"
                  }`}
                >
                  {form.is_active
                    ? "ACTIVE"
                    : "INACTIVE"}
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* ACTIONS */}
          {/* ======================================================= */}

          <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/challenges",
                )
              }
              disabled={submitting}
              className="rounded-lg border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingLabs
              }
              className="rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : "Create Challenge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}