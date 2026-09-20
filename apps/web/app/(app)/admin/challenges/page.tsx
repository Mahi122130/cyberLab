"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

type Challenge = {
  id: number;
  lab_id: number;
  title: string;
  description: string;
  task: string;
  points: number;
  order_number: number;
  is_active: boolean | number | string;
};

type Lab = {
  id: number;
  title: string;
};

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const labsResponse = await fetch(`${API_URL}/labs`);

        if (!labsResponse.ok) {
          throw new Error("Failed to load labs");
        }

        const labsData = await labsResponse.json();

        const labList = Array.isArray(labsData)
          ? labsData
          : labsData.labs || labsData.data || [];

        setLabs(labList);

        const allChallenges: Challenge[] = [];

        for (const lab of labList) {
          const response = await fetch(
            `${API_URL}/labs/${lab.id}/challenges/all`
          );

          if (!response.ok) {
            continue;
          }

          const data = await response.json();

          const list = Array.isArray(data)
            ? data
            : data.challenges || data.data || [];

          allChallenges.push(...list);
        }

        setChallenges(allChallenges);
      } catch (err) {
        console.error(err);
        setError("Failed to load challenges.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function getLabName(labId: number) {
    return (
      labs.find((lab) => lab.id === labId)?.title ||
      `Lab #${labId}`
    );
  }

  function isActive(value: boolean | number | string) {
    return (
      value === true ||
      value === 1 ||
      String(value) === "1"
    );
  }

  return (
    <div className="min-h-screen bg-[#070b12] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Challenges
            </h1>

            <p className="mt-2 text-gray-400">
              Manage cybersecurity challenges across your labs.
            </p>
          </div>

          <Link
            href="/admin/challenges/create"
            className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:bg-cyan-400"
          >
            + Create Challenge
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border border-white/10 bg-[#0d131d] p-10 text-center text-gray-400">
            Loading challenges...
          </div>
        ) : challenges.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#0d131d] p-10 text-center">
            <h2 className="text-xl font-semibold">
              No challenges yet
            </h2>

            <p className="mt-2 text-gray-400">
              Create your first cybersecurity challenge.
            </p>

            <Link
              href="/admin/challenges/create"
              className="mt-6 inline-block rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black"
            >
              Create Challenge
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d131d]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr>
                    <th className="px-5 py-4 text-sm font-medium text-gray-400">
                      Challenge
                    </th>

                    <th className="px-5 py-4 text-sm font-medium text-gray-400">
                      Lab
                    </th>

                    <th className="px-5 py-4 text-sm font-medium text-gray-400">
                      Points
                    </th>

                    <th className="px-5 py-4 text-sm font-medium text-gray-400">
                      Order
                    </th>

                    <th className="px-5 py-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {challenges.map((challenge) => (
                    <tr
                      key={challenge.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">
                          {challenge.title}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          ID #{challenge.id}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {getLabName(challenge.lab_id)}
                      </td>

                      <td className="px-5 py-4 text-cyan-400">
                        {challenge.points}
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {challenge.order_number}
                      </td>

                      <td className="px-5 py-4">
                        {isActive(challenge.is_active) ? (
                          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-500/10 px-3 py-1 text-xs text-gray-400">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}