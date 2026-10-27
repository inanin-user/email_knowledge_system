
'use client';

import { withBasePath } from '@/lib/basePath';
import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

type ReplyEntry = {
  id: number;
  text: string;
};
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

const sidebarCases = [
  { id: 1, subject: 'WS record did not turn red', date: '10/22/2026' },
  { id: 2, subject: 'WSF (BH)', date: '10/06/2026' },
  { id: 3, subject: 'WhatsApp', date: '10/06/2026' },
  { id: 4, subject: 'Rental and sales information', date: '10/12/2026' },
  { id: 5, subject: 'Facebook', date: '10/01/2026' },
  { id: 6, subject: 'Perry', date: '09/29/2026' },
];

export default function AddEmailCasePage() {
  const [subject, setSubject] = useState('');
  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<number>(1);

  const [cases, setCases] = useState<EmailCase[]>([]);
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch(withBasePath('/api/email-cases'));
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


  const [rootCause, setRootCause] = useState('');
  const [inReplies, setInReplies] = useState<ReplyEntry[]>([
    { id: 1, text: '' },
  ]);
  const [userReplies, setUserReplies] = useState<ReplyEntry[]>([
    { id: 2, text: '' },
  ]);
  const [categories, setCategories] = useState<string[]>(['NPS']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function updateReply(
    type: 'in' | 'user',
    id: number,
    text: string,
  ) {
    const update = (items: ReplyEntry[]) =>
      items.map((item) => (item.id === id ? { ...item, text } : item));

    if (type === 'in') {
      setInReplies(update);
    } else {
      setUserReplies(update);
    }
  }

  function addReply(type: 'in' | 'user') {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const newEntry = { id, text: '' };

    if (type === 'in') {
      setInReplies((previous) => [...previous, newEntry]);
    } else {
      setUserReplies((previous) => [...previous, newEntry]);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!subject.trim()) {
      setError('Please enter an email subject.');
      return;
    }

    if (!categories.length) {
      setError('Please select NPS, NPDP, or both.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(withBasePath('/api/email-cases'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          rootCause: rootCause.trim(),
          categories,
          inReplies: inReplies
            .map((item) => item.text.trim())
            .filter(Boolean),
          userReplies: userReplies
            .map((item) => item.text.trim())
            .filter(Boolean),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save email case.');
      }

      setSuccess('Email case created successfully.');

      // Navigate to the case list after a successful save.
      window.location.assign('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex h-dvh min-h-[600px] overflow-hidden bg-[#111111] text-white">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col border-r border-border bg-background text-foreground md:w-[310px] lg:w-[360px] xl:w-[400px]">
        <header className="border-b border-border bg-background p-4 text-foreground">
          <h1 className="mb-4 text-lg font-semibold">Email cases</h1>

          <label className="flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-3">
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
                className={`rounded-full border px-4 py-2 text-sm transition ${activeFilter === filter
                  ? 'rounded-full border border-selected bg-selected px-4 py-2 text-sm text-selected-foreground'
                  : 'rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground hover:bg-surface-muted'
                  }`}
              >
                {filter}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="px-4 py-2 text-xs uppercase tracking-wider text-gray-500">
            Recent cases
          </p>

          {filteredCases.map((item) => (
            <div
              key={item.id}
              className="rounded-xl px-4 py-4 hover:bg-[#222222]"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm">{item.subject}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatDate(item.emailDate)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom-left entry button */}
        <footer className="border-t border-border bg-surface p-4">
          <Link
            href="/"
            className="flex w-full rounded-lg bg-cancel items-center justify-center px-4 py-2 text-cancel-foreground hover:bg-cancel-hover"
          >
            Back to email cases
          </Link>
        </footer>
      </aside>

      {/* Form panel */}
      <section className="flex min-w-0 flex-1 flex-col bg-background text-foreground">
        <header className="border-b border-border bg-surface px-6 py-5 lg:px-8">
          <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
            Knowledge function
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto border-border bg-background p-5 lg:p-8">
          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-4xl space-y-6"
          >
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Email subject <span className="text-red-600">*</span>
              </label>

              <input
                id="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                required
                maxLength={500}
                placeholder="Enter email subject"
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-gray-500 focus:border-selected focus:ring-2 focus:ring-selected/20"
              />
            </div>

            <div>
              <label
                htmlFor="rootCause"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Root cause
              </label>

              <textarea
                id="rootCause"
                value={rootCause}
                onChange={(event) => setRootCause(event.target.value)}
                rows={5}
                placeholder="Describe the issue, investigation, and root cause..."
                className="w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-gray-500 focus:border-selected focus:ring-2 focus:ring-selected/20"
              />
            </div>

            <ReplyEditor
              title="iN Reply"
              entries={inReplies}
              onChange={(id, text) => updateReply('in', id, text)}
              onAdd={() => addReply('in')}
            />

            <ReplyEditor
              title="User Reply"
              entries={userReplies}
              onChange={(id, text) => updateReply('user', id, text)}
              onAdd={() => addReply('user')}
            />

            <fieldset>
              <legend className="mb-3 text-sm font-medium text-foreground">
                Category <span className="text-red-600">*</span>
              </legend>

              <div className="flex flex-wrap gap-6">
                {['NPS', 'NPDP'].map((category) => (
                  <label
                    key={category}
                    className="flex cursor-pointer items-center gap-3 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(category)}
                      onChange={() =>
                        setCategories(
                          categories.includes(category) ? [] : [category]
                        )
                      }
                      className="h-4 w-4 accent-selected"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </fieldset>


            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
              >
                {success}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-5">
              <Link
                href="/"
                className="rounded-lg bg-cancel px-4 py-2 text-cancel-foreground transition-colors hover:bg-cancel-hover"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-confirm px-4 py-2 text-confirm-foreground transition-colors hover:bg-confirm-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save email case'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function ReplyEditor({
  title,
  entries,
  onChange,
  onAdd,
}: {
  title: string;
  entries: ReplyEntry[];
  onChange: (id: number, text: string) => void;
  onAdd: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">
          {title}
        </h3>

        <button
          type="button"
          onClick={onAdd}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-xl text-foreground transition-colors hover:border-selected hover:bg-selected hover:text-selected-foreground"
          aria-label={`Add another ${title}`}
          title={`Add another ${title}`}
        >
          +
        </button>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={entry.id}>
            {entries.length > 1 && (
              <label className="mb-1 block text-xs text-foreground">
                {title} #{index + 1}
              </label>
            )}

            <textarea
              value={entry.text}
              onChange={(event) => onChange(entry.id, event.target.value)}
              rows={3}
              placeholder={`Enter ${title.toLowerCase()}...`}
              className="w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-gray-500 focus:border-selected focus:ring-2 focus:ring-selected/20"
            />
          </div>
        ))}
      </div>
    </section>
  );
}