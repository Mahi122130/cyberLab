"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

type Resource = {
  id: number;
  lab_id: number;
  title: string;
  url: string | null;
  description: string | null;
  resource_type: "DOCUMENTATION" | "TOOL" | "CHEATSHEET" | "EXTERNAL_LINK" | "VIDEO";
  created_at?: string;
  lab_title: string;
  lab_category: string;
  lab_difficulty?: string;
};

type Lab = {
  id: number;
  title: string;
  category: string;
};

const TYPE_CONFIG = {
  DOCUMENTATION: {
    label: "Documentation",
    icon: "📖",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  TOOL: {
    label: "Tool & Proxy",
    icon: "🛠",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  CHEATSHEET: {
    label: "Cheatsheet",
    icon: "📑",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  },
  EXTERNAL_LINK: {
    label: "External Link",
    icon: "🔗",
    badgeClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  },
  VIDEO: {
    label: "Video Guide",
    icon: "🎬",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-400",
  },
};

export default function AdminResourcesPage() {
  const router = useRouter();

  const [resources, setResources] = useState<Resource[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedLabFilter, setSelectedLabFilter] = useState<string>("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    lab_id: 0,
    title: "",
    url: "",
    description: "",
    resource_type: "DOCUMENTATION" as Resource["resource_type"],
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

      // 1. Fetch all resources
      const res = await fetch(`${API_URL}/labs/resources/all`, { headers });
      if (!res.ok) throw new Error("Failed to load learning resources.");
      const data = await res.json();
      const list: Resource[] = Array.isArray(data)
        ? data
        : data?.resources || [];
      setResources(list);

      // 2. Fetch labs
      const labsRes = await fetch(`${API_URL}/labs`, { headers });
      if (labsRes.ok) {
        const labsData = await labsRes.json();
        const labList: Lab[] = Array.isArray(labsData)
          ? labsData
          : labsData?.labs || [];
        setLabs(labList);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load resources data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const openCreateModal = () => {
    setEditingResource(null);
    setFormData({
      lab_id: labs[0]?.id || 0,
      title: "",
      url: "",
      description: "",
      resource_type: "DOCUMENTATION",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (r: Resource) => {
    setEditingResource(r);
    setFormData({
      lab_id: r.lab_id,
      title: r.title,
      url: r.url || "",
      description: r.description || "",
      resource_type: r.resource_type,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalError("Please enter a resource title.");
      return;
    }
    if (!formData.lab_id) {
      setModalError("Please select a valid lab.");
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

      if (editingResource) {
        // Update resource
        const res = await fetch(
          `${API_URL}/labs/resources/${editingResource.id}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              lab_id: Number(formData.lab_id),
              title: formData.title.trim(),
              url: formData.url.trim() || null,
              description: formData.description.trim() || null,
              resource_type: formData.resource_type,
            }),
          }
        );
        if (!res.ok) throw new Error("Failed to update resource.");
      } else {
        // Create resource
        const res = await fetch(`${API_URL}/labs/resources`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            lab_id: Number(formData.lab_id),
            title: formData.title.trim(),
            url: formData.url.trim() || null,
            description: formData.description.trim() || null,
            resource_type: formData.resource_type,
          }),
        });
        if (!res.ok) throw new Error("Failed to create resource.");
      }

      setIsModalOpen(false);
      await loadAllData();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Error saving resource.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResource = async (id: number) => {
    if (!confirm("Are you sure you want to remove this learning resource?")) {
      return;
    }

    const token = localStorage.getItem("cyberlab_token");
    try {
      const res = await fetch(`${API_URL}/labs/resources/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete resource.");
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete resource.");
    }
  };

  // Filtered resources
  const filteredResources = resources.filter((r) => {
    const matchesLab =
      selectedLabFilter === "ALL" || String(r.lab_id) === selectedLabFilter;
    const matchesType =
      selectedTypeFilter === "ALL" || r.resource_type === selectedTypeFilter;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      r.title.toLowerCase().includes(query) ||
      (r.description && r.description.toLowerCase().includes(query)) ||
      (r.lab_title && r.lab_title.toLowerCase().includes(query));
    return matchesLab && matchesType && matchesSearch;
  });

  // Calculate stats
  const docsCount = resources.filter((r) => r.resource_type === "DOCUMENTATION").length;
  const toolsCount = resources.filter((r) => r.resource_type === "TOOL").length;
  const cheatsheetsCount = resources.filter((r) => r.resource_type === "CHEATSHEET").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 font-mono text-purple-400">
              ▣
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Learning Resources
              </h1>
              <p className="text-xs text-slate-400">
                Manage supplementary reading, official cheat sheets, tools, and technical references attached to lab environments.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-500/40 bg-purple-500/15 px-4 py-2 text-xs font-semibold text-purple-300 transition-colors hover:bg-purple-500/25 active:scale-95"
        >
          <span className="text-sm leading-none">+</span> Add Resource
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#0c111a] p-4">
          <div className="font-mono text-xs text-slate-400">TOTAL RESOURCES</div>
          <div className="mt-1 font-mono text-2xl font-bold text-purple-400">
            {resources.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Across all environments</div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c111a] p-4">
          <div className="font-mono text-xs text-slate-400">DOCUMENTATION</div>
          <div className="mt-1 font-mono text-2xl font-bold text-blue-400">
            {docsCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Guides & standards</div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c111a] p-4">
          <div className="font-mono text-xs text-slate-400">SECURITY TOOLS</div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-400">
            {toolsCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Proxies, scanners & scripts</div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c111a] p-4">
          <div className="font-mono text-xs text-slate-400">CHEATSHEETS</div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
            {cheatsheetsCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Quick syntax references</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/[0.08] bg-[#0c111a] p-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resource title, description, or lab..."
            className="w-full rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedLabFilter}
            onChange={(e) => setSelectedLabFilter(e.target.value)}
            className="rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white focus:border-purple-500/50 focus:outline-none"
          >
            <option value="ALL">All Labs ({resources.length})</option>
            {labs.map((lab) => (
              <option key={lab.id} value={String(lab.id)}>
                {lab.title}
              </option>
            ))}
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white focus:border-purple-500/50 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            {Object.entries(TYPE_CONFIG).map(([type, config]) => (
              <option key={type} value={type}>
                {config.icon} {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid / Cards */}
      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center font-mono text-xs text-purple-400 rounded-xl border border-white/[0.08] bg-[#0c111a]">
          LOADING RESOURCES...
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-white/[0.08] bg-[#0c111a]">
          <div className="font-mono text-xs text-red-400">ERROR LOADING RESOURCES</div>
          <p className="mt-2 text-xs text-slate-400">{error}</p>
          <button
            onClick={loadAllData}
            className="mt-4 rounded border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
          >
            Retry
          </button>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="p-12 text-center text-slate-400 rounded-xl border border-white/[0.08] bg-[#0c111a]">
          <div className="text-2xl mb-2">▣</div>
          <div className="font-medium text-white text-sm">No resources found</div>
          <p className="text-xs text-slate-500 mt-1">
            {search || selectedLabFilter !== "ALL" || selectedTypeFilter !== "ALL"
              ? "Try clearing your search or filters to see more materials."
              : "No learning materials have been attached to labs yet."}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-400 hover:bg-purple-500/20"
          >
            + Add First Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredResources.map((r) => {
            const config = TYPE_CONFIG[r.resource_type] || TYPE_CONFIG.DOCUMENTATION;
            return (
              <div
                key={r.id}
                className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0c111a] p-5 transition-colors hover:border-white/[0.16]"
              >
                <div>
                  {/* Top metadata tags */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold ${config.badgeClass}`}
                      >
                        <span>{config.icon}</span> {config.label}
                      </span>
                      <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                        {r.lab_title}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-slate-500">
                      ID: #{r.id}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-sm font-bold text-white leading-snug">
                    {r.title}
                  </h3>

                  {/* Description */}
                  {r.description && (
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {r.description}
                    </p>
                  )}
                </div>

                {/* Bottom row with URL link and Actions */}
                <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
                  <div>
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Visit Link ↗
                      </a>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500">
                        Internal Note
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(r)}
                      className="rounded border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-slate-300 hover:border-purple-500/40 hover:text-purple-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteResource(r.id)}
                      className="rounded border border-red-500/20 bg-red-500/10 px-2.5 py-1 font-mono text-[11px] text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/[0.12] bg-[#0d121c] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h2 className="text-base font-bold text-white">
                {editingResource ? "Edit Learning Resource" : "Add Learning Resource"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="mt-4 space-y-4">
              {modalError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                  {modalError}
                </div>
              )}

              {/* Lab Selector */}
              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1">
                  ATTACH TO LAB
                </label>
                <select
                  value={formData.lab_id}
                  onChange={(e) =>
                    setFormData({ ...formData, lab_id: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                >
                  {labs.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.title} ({lab.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Resource Type */}
              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1">
                  RESOURCE TYPE
                </label>
                <select
                  value={formData.resource_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      resource_type: e.target.value as Resource["resource_type"],
                    })
                  }
                  className="w-full rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                >
                  {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                    <option key={type} value={type}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1">
                  TITLE
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. OWASP Top 10 IDOR Prevention Guide"
                  className="w-full rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1">
                  TARGET URL (OPTIONAL)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  placeholder="https://portswigger.net/... or https://owasp.org/..."
                  className="w-full rounded-lg border border-white/[0.1] bg-[#06090e] px-3 py-2 text-xs text-white focus:border-purple-500/50 focus:outline-none font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1">
                  DESCRIPTION & KEY TAKEAWAYS
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Summary of what students will find and learn from this reference..."
                  className="w-full rounded-lg border border-white/[0.1] bg-[#06090e] p-3 text-xs text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none leading-relaxed"
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
                  className="rounded-lg border border-purple-500/40 bg-purple-500/20 px-4 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/30 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingResource
                    ? "Save Changes"
                    : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
