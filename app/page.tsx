"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
type MessageType = "user" | "in_reply";

type EmailMessage = {
  id: number;
  type: MessageType;
  sender: string;
  body: string;
  sentAt: string;
};

type EmailCase = {
  id: number;
  subject: string;
  emailDate: string;
  category: string;
  rootCause: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  messages: EmailMessage[];
};

const initialCases: EmailCase[] = [
  {
    id: 1,
    subject: "WS record did not turn red",
    emailDate: "2026-10-22 09:00",
    category: "NPS",
    status: "open",
    rootCause:
      'WS record PS-PQL773 was confirmed/sent in NPS after 18:00 on 10/15 using "release" in the draft PWS function. According to the expected logic, the WS should be sent automatically by 01:00 on 10/16 and its status should turn red. However, the status did not turn red to alert the factory user to download the PWS record.\n\nOther affected WS records:\nPS-PQL773\nPS-PQL778\nPS-PQL779',
    messages: [
      {
        id: 2,
        type: "user",
        sender: "User",
        body: "The WS record did not turn red as expected. Please investigate the automatic sending logic and related records.",
        sentAt: "2026-10-22 09:30",
      },
      {
        id: 3,
        type: "in_reply",
        sender: "iN consultant",
        body: "We will investigate the draft PWS release function, automatic sending process, and the database status updates.",
        sentAt: "2026-10-22 10:15",
      },
    ],
  },
  {
    id: 2,
    subject: "WSF (BH)",
    emailDate: "2026-10-06 14:30",
    category: "NPDP",
    status: "in_progress",
    rootCause:
      "The root cause has not yet been confirmed. Further investigation is required.",
    messages: [
      {
        id: 4,
        type: "user",
        sender: "User",
        body: "WSF (BH) — issue details pending investigation.",
        sentAt: "2026-10-06 14:30",
      },
      {
        id: 5,
        type: "user",
        sender: "User",
        body: "Please check this issue.",
        sentAt: "2026-10-06 15:00",
      },
    ],
  },
  {
    id: 3,
    subject: "WhatsApp",
    emailDate: "2026-10-06 11:20",
    category: "NPS",
    status: "open",
    rootCause: "Root cause has not been provided.",
    messages: [
      {
        id: 6,
        type: "user",
        sender: "User",
        body: "WhatsApp — issue details pending investigation.",
        sentAt: "2026-10-06 11:20",
      },
    ],
  },
  {
    id: 4,
    subject: "Rental and sales information",
    emailDate: "2026-10-12 16:00",
    category: "NPDP",
    status: "resolved",
    rootCause: "Root cause has not been provided.",
    messages: [
      {
        id: 7,
        type: "user",
        sender: "User",
        body: "Rental and sales information — example case.",
        sentAt: "2026-10-12 16:00",
      },
    ],
  },
];

const filters = ["All", "NPDP", "NPS"];

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

function formatDateTime(value: string) {
  if (!value) return "";

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getStatusLabel(status: EmailCase["status"]) {
  return {
    open: "Open",
    in_progress: "In progress",
    resolved: "Resolved",
    closed: "Closed",
  }[status];
}

export default function EmailCasesPage() {
  const [cases, setCases] = useState<EmailCase[]>([]);
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch("/api/email-cases");
        if (!res.ok) {
          throw new Error(`Failed to fetch cases: ${res.status}`);
        }
        const json = await res.json();
        setCases(json.data);
        console.log("Fetched email cases:", json.data);
      } catch (err) {
        console.error("Error fetching email cases:", err);
      }
    };

    fetchCases();
  }, []);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cases.filter((item) => {
      const matchesCategory =
        activeFilter === "All" || item.category === activeFilter;

      const matchesSearch =
        !query ||
        item.subject.toLowerCase().includes(query) ||
        item.rootCause.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [cases, search, activeFilter]);

  const selectedCase =
    filteredCases.find((item) => item.id === selectedId) ??
    filteredCases[0] ??
    null;

  const messages =
    selectedCase?.messages
      .filter(
        (message) =>
          (message.type === "user" &&
            message.body.trim() !== selectedCase.rootCause.trim()) ||
          message.type === "in_reply",
      )
      .sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
      ) ?? [];

  return (
    <main className="flex h-dvh min-h-[500px] overflow-hidden bg-[#111111] text-white">
      {/* Left panel */}
      <aside className="flex w-full shrink-0 flex-col border-r border-[#303030] md:w-[310px] lg:w-[360px] xl:w-[400px]">
        <header className="border-b border-[#303030] p-4">
          <h1 className="mb-4 text-lg font-semibold">Email cases</h1>

          <label className="flex items-center gap-3 rounded-full bg-[#303030] px-4 py-3">
            <span className="text-lg text-gray-400" aria-hidden="true">
              ⌕
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a subject"
              aria-label="Search email cases"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </label>

          <nav className="mt-4 flex gap-2" aria-label="Filter by category">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={activeFilter === filter}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  activeFilter === filter
                    ? "border-emerald-700 bg-emerald-900/50 text-emerald-300"
                    : "border-[#383838] text-gray-300 hover:bg-[#282828]"
                }`}
              >
                {filter}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pb-2 pt-5 text-xs font-medium uppercase tracking-wider text-gray-500">
            Email list ({filteredCases.length})
          </div>

          {filteredCases.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400">
              No matching email cases found.
            </p>
          ) : (
            <ul className="space-y-1 px-2 pb-4">
              {filteredCases.map((item) => {
                const isSelected = selectedCase?.id === item.id;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      aria-current={isSelected ? "true" : undefined}
                      className={`w-full rounded-xl px-4 py-4 text-left transition ${
                        isSelected ? "bg-[#303030]" : "hover:bg-[#222222]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="line-clamp-2 text-sm font-medium leading-6">
                          {item.subject}
                        </span>

                        <span className="shrink-0 pt-1 text-xs text-gray-400">
                          {formatDate(item.emailDate)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <span>{item.category}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <footer className="border-t border-[#303030] bg-[#111111] p-4">
          <Link
            href="/add-email-case"
            className="flex w-full items-center justify-center gap-2
              rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold
              text-white transition hover:bg-emerald-600"
          >
            <span className="text-xl leading-none" aria-hidden="true">
              +
            </span>
            Add email case
          </Link>
        </footer>
      </aside>

      {/* Right panel */}
      <section className="hidden min-w-0 flex-1 flex-col md:flex">
        {selectedCase ? (
          <>
            <header className="border-b border-[#303030] px-6 py-5 lg:px-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="break-words text-xl font-semibold lg:text-2xl">
                    {selectedCase.subject}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400">
                    <span>{selectedCase.category}</span>

                    <span>{formatDate(selectedCase.emailDate)}</span>
                  </div>
                </div>

                <span className="rounded-full border border-[#454545] px-3 py-1 text-xs text-gray-300">
                  {getStatusLabel(selectedCase.status)}
                </span>
              </div>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-5 lg:p-8">
              {/* Root cause */}
              <section className="rounded-lg bg-[#f5f5f5] p-5 text-[#202020]">
                <h3 className="mb-3 text-base font-semibold">Root cause</h3>

                <p className="whitespace-pre-wrap break-words text-sm leading-7">
                  {selectedCase.rootCause || "No root cause recorded yet."}
                </p>
              </section>

              {/* Messages */}
              <MessageSection messages={messages} emptyText="No recorded." />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-gray-400">
            Select an email case to view its details.
          </div>
        )}
      </section>
    </main>
  );
}

function MessageHeader({ message }: { message: EmailMessage }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <time
        className={`text-xs ${
          message.type !== "user"
            ? "text-gray-200 text-left"
            : "text-gray-100 text-right"
        }`}
      >
        {formatDateTime(message.sentAt)}
      </time>
    </div>
  );
}


function MessageSection({
  messages,
  emptyText,
}: {
  messages: EmailMessage[];
  emptyText: string;
}) {
  return (
    <section>
      {messages.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => {
            const isUser = message.type === "user";

            return (
              <div key={message.id}>
                <h3
                  className={`mb-3 text-sm font-semibold text-gray-300 ${
                    !isUser ? "text-right" : "text-left"
                  }`}
                >
                  {message.sender}
                </h3>

                <article
                  className={`max-w-[95%] rounded-xl p-4 lg:max-w-[85%] ${
                    !isUser ? "ml-auto bg-[#075e45]" : "mr-auto bg-[#292929]"
                  }`}
                >

                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-100">
                    {message.body}
                  </p>
                  <MessageHeader message={message} />
                </article>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

