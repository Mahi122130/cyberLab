"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

type Hint = {
  id: number;
  challenge_id: number;
  hint_text: string;
  hint_order: number;
  created_at?: string;
  challenge_title: string;
  challenge_points?: number;
  lab_id: number;
  lab_title: string;
  lab_category: string;
};

type Lab = {
  id: number;
  title: string;
  category: string;
};

type ChallengeOption = {
  id: number;
  lab_id: number;
  title: string;
};

export default function AdminHintsPage() {
  const router = useRouter();

  const [hints, setHints] = useState<Hint[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [challenges, setChallenges] = useState<ChallengeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedLabFilter, setSelectedLabFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHint, setEditingHint] = useState<Hint | null>(null);
  const [formData, setFormData] = useState({
    lab_id: 0,
    challenge_id: 0,
    hint_order: 1,
    hint_text: "",
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadAllData = async () => {
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

    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      // 1. Fetch all hints
      const hintsRes = await fetch(`${API_URL}/labs/hints/all`, { headers });
      if (!hintsRes.ok) throw new Error("Failed to load hints.");
      const hintsData = await hintsRes.json();
      const hintList: Hint[] = Array.isArray(hintsData)
        ? hintsData
        : hintsData?.hints || [];
      setHints(hintList);

      // 2. Fetch labs
      const labsRes = await fetch(`${API_URL}/labs`, { headers });
      if (labsRes.ok) {
        const labsData = await labsRes.json();
        const labList: Lab[] = Array.isArray(labsData)
          ? labsData
          : labsData?.labs || [];
        setLabs(labList);

        // 3. Fetch challenges for each lab to populate challenge dropdown in add modal
        const challengeList: ChallengeOption[] = [];
        for (const lab of labList) {
          try {
            const chRes = await fetch(`${API_URL}/labs/${lab.id}/challenges/all`, { headers });
            if (chRes.ok) {
              const chData = await chRes.json();
              const list = Array.isArray(chData)
                ? chData
                : chData?.challenges || [];
              for (const c of list) {
                challengeList.push({ id: c.id, lab_id: lab.id, title: c.title });
              }
            }
          } catch {
            // ignore lab challenge fetch failure
          }
        }
        setChallenges(challengeList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hints data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const openCreateModal = () => {
    setEditingHint(null);
    const defaultLabId = labs[0]?.id || 0;
    const labChallenges = challenges.filter((c) => c.lab_id === defaultLabId);
    setFormData({
      lab_id: defaultLabId,
      challenge_id: labChallenges[0]?.id || 0,
      hint_order: 1,
      hint_text: "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (hint: Hint) => {
    setEditingHint(hint);
    setFormData({
      lab_id: hint.lab_id,
      challenge_id: hint.challenge_id,
      hint_order: hint.hint_order,
      hint_text: hint.hint_text,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleLabSelectChange = (labId: number) => {
    const labChallenges = challenges.filter((c) => c.lab_id === labId);
    setFormData((prev) => ({
      ...prev,
      lab_id: labId,
      challenge_id: labChallenges[0]?.id || 0,
    }));
  };

  const handleSaveHint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hint_text.trim()) {
      setModalError("Please enter hint text.");
      return;
    }

    const token = localStorage.getItem("cyberlab_token");
    setSaving(true);
    setModalError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (editingHint) {
        // Edit existing hint
        const res = await fetch(`${API_URL}/labs/hints/${editingHint.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            hint_text: formData.hint_text.trim(),
            hint_order: Number(formData.hint_order),
          }),
        });
        if (!res.ok) throw new Error("Failed to update hint.");
      } else {
        // Create new hint
        if (!formData.challenge_id) {
          throw new Error("Please select a valid challenge.");
        }
        const res = await fetch(`${API_URL}/labs/hints`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            challenge_id: Number(formData.challenge_id),
            hint_text: formData.hint_text.trim(),
            hint_order: Number(formData.hint_order),
          }),
        });
        if (!res.ok) throw new Error("Failed to create hint.");
      }

      setIsModalOpen(false);
      await loadAllData();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Error saving hint.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHint = async (hintId: number) => {
    if (!confirm("Are you sure you want to delete this hint? This action cannot be undone.")) {
      return;
    }

    const token = localStorage.getItem("cyberlab_token");
    try {
      const res = await fetch(`${API_URL}/labs/hints/${hintId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete hint.");
      setHints((prev) => prev.filter((h) => h.id !== hintId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete hint.");
    }
  };

  // Filtered hints
  const filteredHints = hints.filter((hint) => {
    const matchesLab =
      selectedLabFilter === "ALL" || String(hint.lab_id) === selectedLabFilter;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      hint.hint_text.toLowerCase().includes(query) ||
      hint.challenge_title.toLowerCase().includes(query) ||
      hint.lab_title.toLowerCase().includes(query);
    return matchesLab && matchesSearch;
  });

  // Calculate high-level stats
  const uniqueChallenges = new Set(hints.map((h) => h.challenge_id)).size;
  const uniqueLabs = new Set(hints.map((h) => h.lab_id)).size;
  const maxOrder = hints.length > 0 ? Math.max(...hints.map((h) => h.hint_order)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 font-mono text-cyan-400">
              ◎
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Hints Management
              </h1>
              <p className="text-xs text-slate-400">
                Configure graduated guidance, manage hint reveal order, and support students through challenge roadblocks.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/25 active:scale-95"
        >
          <span className="text-sm leading-none">+</span> Add New Hint
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#0c111a] p-4">
          <div className="font-mono text-xs text-slate-400">TOTAL HINTS</div>
          <div className="mt-1 font-mono text-2xl font-bold text-cyan-400">
            {hints.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Across all challenges</div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c111a] p-4">
          <div className="font-mono text-xs text-slate-400">CHALLENGES COVERED</div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
            {uniqueChallenges}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Have configured hints</div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c111a] p-4">
          <div className="font-mono text-xs text-slate-400">LABS WITH HINTS</div>
          <div className="mt-1 font-mono text-2xl font-bold text-violet-400">
            {uniqueLabs}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Active environments</div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c111a] p-4">
          <div className="font-mono text-xs text-slate-400">MAX HINT DEPTH</div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-400">
            {maxOrder}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Tier steps per challenge</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/[0.08] bg-[#0c111a] p-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hint text, challenge title, or lab..."
            className="w-full rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Filter by Lab:</label>
          <select
            value={selectedLabFilter}
            onChange={(e) => setSelectedLabFilter(e.target.value)}
            className="rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
          >
            <option value="ALL">All Labs ({hints.length})</option>
            {labs.map((lab) => (
              <option key={lab.id} value={String(lab.id)}>
                {lab.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c111a]">
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center font-mono text-xs text-cyan-400">
            LOADING HINTS...
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="font-mono text-xs text-red-400">ERROR LOADING HINTS</div>
            <p className="mt-2 text-xs text-slate-400">{error}</p>
            <button
              onClick={loadAllData}
              className="mt-4 rounded border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
            >
              Retry
            </button>
          </div>
        ) : filteredHints.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="text-2xl mb-2">◎</div>
            <div className="font-medium text-white text-sm">No hints found</div>
            <p className="text-xs text-slate-500 mt-1">
              {search || selectedLabFilter !== "ALL"
                ? "Try clearing your search or filter to see more hints."
                : "No challenge hints have been created yet."}
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-400 hover:bg-cyan-500/20"
            >
              + Create First Hint
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] font-mono text-[11px] text-slate-400">
                <tr>
                  <th className="px-4 py-3">ORDER</th>
                  <th className="px-4 py-3">LAB & CHALLENGE</th>
                  <th className="px-4 py-3">HINT CONTENT</th>
                  <th className="px-4 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredHints.map((hint) => (
                  <tr
                    key={hint.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Order / ID */}
                    <td className="whitespace-nowrap px-4 py-3.5 align-top">
                      <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-cyan-300">
                        Tier #{hint.hint_order}
                      </span>
                      <div className="mt-1 font-mono text-[10px] text-slate-500">
                        ID: {hint.id}
                      </div>
                    </td>

                    {/* Lab & Challenge */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                          {hint.lab_category || "Lab"}
                        </span>
                        <span className="font-medium text-slate-300">
                          {hint.lab_title}
                        </span>
                      </div>
                      <div className="mt-1">
                        <Link
                          href={`/admin/challenges/${hint.challenge_id}`}
                          className="font-semibold text-white hover:text-cyan-400 transition-colors"
                        >
                          {hint.challenge_title}
                        </Link>
                      </div>
                      {hint.challenge_points !== undefined && (
                        <div className="mt-0.5 font-mono text-[10px] text-emerald-400/80">
                          {hint.challenge_points} PTS
                        </div>
                      )}
                    </td>

                    {/* Hint Text */}
                    <td className="px-4 py-3.5 align-top text-slate-300 leading-relaxed max-w-lg">
                      <p className="font-sans text-xs whitespace-pre-wrap">
                        {hint.hint_text}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-right align-top">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(hint)}
                          className="rounded border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHint(hint.id)}
                          className="rounded border border-red-500/20 bg-red-500/10 px-2.5 py-1 font-mono text-[11px] text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/[0.12] bg-[#0d121c] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h2 className="text-base font-bold text-white">
                {editingHint ? "Edit Challenge Hint" : "Create New Hint"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHint} className="mt-4 space-y-4">
              {modalError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                  {modalError}
                </div>
              )}

              {/* Lab Selector (only if creating) */}
              {!editingHint && (
                <>
                  <div>
                    <label className="block font-mono text-[11px] text-slate-400 mb-1">
                      SELECT LAB
                    </label>
                    <select
                      value={formData.lab_id}
                      onChange={(e) => handleLabSelectChange(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
                    >
                      {labs.map((lab) => (
                        <option key={lab.id} value={lab.id}>
                          {lab.title} ({lab.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-slate-400 mb-1">
                      SELECT CHALLENGE
                    </label>
                    <select
                      value={formData.challenge_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          challenge_id: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
                    >
                      {challenges
                        .filter((c) => c.lab_id === formData.lab_id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}

              {/* Order */}
              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1">
                  HINT ORDER / TIER (1, 2, 3...)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.hint_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hint_order: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  Lower order hints are revealed first to students.
                </p>
              </div>

              {/* Hint Text */}
              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1">
                  HINT TEXT
                </label>
                <textarea
                  rows={4}
                  value={formData.hint_text}
                  onChange={(e) =>
                    setFormData({ ...formData, hint_text: e.target.value })
                  }
                  placeholder="Provide guiding advice without giving away the complete solution directly..."
                  className="w-full rounded-lg border border-white/[0.1] bg-[#06090e] p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingHint ? "Save Changes" : "Create Hint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
