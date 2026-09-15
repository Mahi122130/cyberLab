"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

type Lab = {
  id: number;
  title: string;
  slug: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  is_active: boolean | number;
};

export default function CreateChallengePage() {
  const router = useRouter();

  const [labs, setLabs] = useState<Lab[]>([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    lab_id: "",
    title: "",
    description: "",
    task: "",
    points: "100",
    order_number: "1",
    is_active: true,
  });

  useEffect(() => {
    async function loadLabs() {
      try {
        setLoadingLabs(true);

        const response = await fetch(`${API_URL}/labs`);

        if (!response.ok) {
          throw new Error("Failed to load labs");
        }

        const data = await response.json();

        const labList = Array.isArray(data)
          ? data
          : data.labs || data.data || [];

        setLabs(labList);
      } catch (err) {
        console.error(err);
        setError("Failed to load labs.");
      } finally {
        setLoadingLabs(false);
      }
    }

    loadLabs();
  }, []);

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.lab_id) {
      setError("Please select a lab.");
      return;
    }

    if (!form.title.trim()) {
      setError("Challenge title is required.");
      return;
    }

    if (!form.task.trim()) {
      setError("Challenge task is required.");
      return;
    }

    const labId = Number(form.lab_id);

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/labs/${labId}/challenges`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim(),
            task: form.task.trim(),
            points: Number(form.points),
            order_number: Number(form.order_number),
            is_active: form.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to create challenge."
        );
      }

      setSuccess("Challenge created successfully!");

      setForm({
        lab_id: "",
        title: "",
        description: "",
        task: "",
        points: "100",
        order_number: "1",
        is_active: true,
      });

      setTimeout(() => {
        router.push("/admin/challenges");
      }, 1000);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create challenge."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070b12] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin/challenges")}
            className="mb-4 text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Challenges
          </button>

          <h1 className="text-3xl font-bold">
            Create Challenge
          </h1>

          <p className="mt-2 text-gray-400">
            Create a new cybersecurity challenge for one of your labs.
          </p>
        </div>

        {/* Alerts */}
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-[#0d131d] p-6 shadow-xl"
        >
          {/* Lab */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Lab
            </label>

            <select
              value={form.lab_id}
              onChange={(event) =>
                updateField("lab_id", event.target.value)
              }
              disabled={loadingLabs || submitting}
              className="w-full rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white outline-none transition focus:border-cyan-500"
            >
              <option value="">
                {loadingLabs
                  ? "Loading labs..."
                  : "Select a lab"}
              </option>

              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.title} — {lab.difficulty}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Challenge Title
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              placeholder="Example: Hidden Admin Panel"
              disabled={submitting}
              className="w-full rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Explain the scenario and background of the challenge."
              rows={4}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* Task */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Task
            </label>

            <textarea
              value={form.task}
              onChange={(event) =>
                updateField("task", event.target.value)
              }
              placeholder="Tell the student what they need to accomplish."
              rows={5}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* Points + Order */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Points
              </label>

              <input
                type="number"
                min="0"
                value={form.points}
                onChange={(event) =>
                  updateField("points", event.target.value)
                }
                disabled={submitting}
                className="w-full rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white outline-none transition focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Order Number
              </label>

              <input
                type="number"
                min="1"
                value={form.order_number}
                onChange={(event) =>
                  updateField(
                    "order_number",
                    event.target.value
                  )
                }
                disabled={submitting}
                className="w-full rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-white outline-none transition focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#080d15] px-4 py-4">
            <div>
              <p className="font-medium text-white">
                Active Challenge
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Students can see this challenge when it is active.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateField("is_active", !form.is_active)
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

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/challenges")
              }
              disabled={submitting}
              className="rounded-lg border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loadingLabs}
              className="rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : "Create Challenge"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}