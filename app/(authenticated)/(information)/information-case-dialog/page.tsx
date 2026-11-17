"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { withBasePath } from "@/lib/basePath";

type InformationCase = {
  id: number;
  subject: string;
  emailDate: string;
  category: string;
  rootCause?: string | null;
  status: string;
};

const filters = ["All", "NPDP", "NPS"] as const;

function Priority({ value }: { value: string }) {
  const styles: Record<string, string> = {
    High: "bg-red-50 text-red-600",
    Medium: "bg-amber-50 text-amber-700",
    Low: "bg-blue-50 text-blue-600",
  };

  return (
    <span
      className={`rounded-md px-3 py-1 text-xs font-medium ${styles[value]}`}
    >
      {value}
    </span>
  );
}

function Status({ value }: { value: string }) {
  const styles: Record<string, string> = {
    "In progress": "bg-blue-50 text-blue-700",
    Open: "bg-purple-50 text-purple-700",
    Resolved: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-medium ${styles[value]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}

function formatDate(value: string) {
  if (!value) return "Date unavailable";

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function InformationCaseDashboard() {
  const [cases, setCases] = useState<InformationCase[]>([]);
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const controller = new AbortController();

    async function loadCases() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(withBasePath("/api/information-cases"), {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to load cases (${response.status}).`);
        }
        const jsonData = await response.json();

        // Supports either an array response or { cases: [...] }.
        const records = jsonData.data;
        if (!Array.isArray(records)) {
          throw new Error("Unexpected Information Case API response.");
        }

        setCases(records);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadCases();

    return () => controller.abort();
  }, []);

  const filteredCases = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return cases.filter((item) => {
      const matchesCategory =
        activeFilter === "All" || item.category === activeFilter;

      const matchesSearch =
        !keyword ||
        item.subject?.toLowerCase().includes(keyword) ||
        item.rootCause?.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [cases, search, activeFilter]);

  const totalCases = filteredCases.length;

  const totalPages = Math.ceil(totalCases / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCases);

  const paginatedCases = filteredCases.slice(startIndex, endIndex);

  // Display no more than 3 page buttons.
  const pageStart = Math.max(1, Math.min(currentPage - 1, totalPages - 2));

  const visiblePages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, index) => pageStart + index,
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilter]);

  const statusChart = useMemo(() => {
    const statusOptions = [
      { key: "in_progress", label: "In Progress" },
      { key: "confirmed", label: "Confirmed" },
      { key: "pending", label: "Pending" },
      { key: "waiting", label: "Waiting" },
      { key: "follow_up", label: "Follow Up" },
    ];

    // Apply category filter, but not the search keyword.
    const categoryCases = cases.filter(
      (item) => activeFilter === "All" || item.category === activeFilter,
    );

    const total = categoryCases.length;

    return {
      total,
      items: statusOptions.map((status) => {
        const count = categoryCases.filter(
          (item) => item.status === status.key,
        ).length;

        return {
          ...status,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        };
      }),
    };
  }, [cases, activeFilter]);
  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          {/* <p className="text-xs font-semibold uppercase tracking-wider text-[#7961e8]">
            Information Management
          </p> */}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#24283d]">
            Overview
          </h1>
          <p className="mt-1 text-sm text-[#858ca3]">
            Monitor information cases, daily operations and application health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#e1e4ed] bg-white px-4 py-3 text-sm text-[#596078]">
            Nov 4 – Nov 10, 2026
            <span className="ml-5">⌄</span>
          </div>
          <Link
            href="/add-information-case"
            className="rounded-lg bg-[#7560dc] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#654fce]"
          >
            + New Request
          </Link>
        </div>
      </div>

      {/* Information Case Status Chart */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        {/* Chart heading */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Information Case Status
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Distribution of cases by current status.
            </p>
          </div>

          <div className="rounded-lg bg-confirm/10 px-4 py-2 text-right">
            <p className="text-xs text-gray-500">Total cases</p>
            <p className="text-2xl font-bold text-confirm tabular-nums">
              {statusChart.total}
            </p>
          </div>
        </div>

        {/* Chart content */}
        {isLoading ? (
          <p className="py-10 text-center text-sm text-gray-500">
            Loading case statistics...
          </p>
        ) : error ? (
          <p className="py-10 text-center text-sm text-red-600">{error}</p>
        ) : statusChart.total === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">
            No information cases available.
          </p>
        ) : (
          <div className="space-y-6">
            {statusChart.items.map((item) => (
              <div key={item.key}>
                {/* Status label and count */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {item.percentage.toFixed(1)}%
                    </span>

                    <span className="min-w-8 text-right text-sm font-semibold tabular-nums text-foreground">
                      {item.count}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  className="h-4 w-full overflow-hidden rounded-full bg-gray-100"
                  role="progressbar"
                  aria-label={`${item.label}: ${item.count} cases`}
                  aria-valuenow={item.count}
                  aria-valuemin={0}
                  aria-valuemax={statusChart.total}
                >
                  <div
                    className="h-full rounded-full bg-confirm transition-all duration-500 ease-out"
                    style={{
                      width: `${item.percentage}%`,
                      minWidth: item.count > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart footer */}
        <div className="mt-7 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-confirm" />
            <span className="text-xs text-gray-500">Information Cases</span>
          </div>

          <span className="text-xs text-gray-400">
            {activeFilter === "All" ? "All categories" : activeFilter}
          </span>
        </div>
      </section>

      {/* Case queue */}
      <section className="overflow-hidden rounded-xl border border-[#e4e7ef] bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#edf0f5] px-6">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "border-confirm text-confirm"
                  : "border-transparent text-gray-500 hover:text-confirm"
              }`}
            >
              {filter}
            </button>
          ))}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="w-48 rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-confirm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-[#fafbfe] text-[10px] font-semibold uppercase tracking-wide text-[#9298aa]">
              <tr>
                <th className="px-6 py-4">Case</th>
                <th className="px-4 py-4">Requester</th>
                <th className="px-4 py-4">Priority</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Assignee</th>
                <th className="px-4 py-4">Updated</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.map((item) => {
                const categories = Array.isArray(item.category)
                  ? item.category
                  : Array.isArray(item.category)
                    ? item.category
                    : typeof item.category === "string" && item.category.trim()
                      ? [item.category]
                      : [];

                return (
                  <tr
                    key={item.id}
                    className="border-t border-[#edf0f5] text-sm hover:bg-[#fafbfe]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div>
                          <p className="font-medium text-[#30354b]">
                            {item.subject}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {categories.length > 0 ? (
                              categories.map((category) => (
                                <span
                                  key={category}
                                  className="rounded-md bg-[#f0eef8] px-2 py-0.5 text-xs text-[#71639a]"
                                >
                                  {category}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-[#9298aa]">
                                No category
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-[#69718a]">iN admin</td>

                    <td className="px-4 py-4">
                      <Priority value="Low" />
                    </td>

                    <td className="px-4 py-4">
                      <Status value={item.status} />
                    </td>

                    <td className="px-4 py-4 text-[#69718a]">iN admin</td>

                    <td className="px-4 py-4 text-xs text-[#9298aa]">
                      {formatDate(item.emailDate)}
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        href={`/edit-information-case/${item.id}`}
                        className="inline-flex items-center rounded-md border border-[#d9dce7] px-3 py-1.5 text-xs font-medium text-[#555d75] transition hover:border-[#71639a] hover:bg-[#f0eef8] hover:text-[#71639a]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#edf0f5] px-6 py-4 text-xs text-[#9298aa]">
          <span>
            Showing {totalCases === 0 ? 0 : startIndex + 1}–{endIndex} of{" "}
            {totalCases} cases
          </span>

          <div className="flex items-center gap-2">
            {/* Previous */}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-md px-3 py-2 transition hover:bg-purple-50 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {/* Page numbers: maximum 3 */}
            {visiblePages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`rounded-md px-3 py-2 font-semibold transition ${
                  currentPage === page
                    ? "bg-purple-50 text-purple-600"
                    : "text-[#9298aa] hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage >= totalPages}
              className="rounded-md px-3 py-2 transition hover:bg-purple-50 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
