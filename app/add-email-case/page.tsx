
'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

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

  function toggleCategory(category: string) {
    setCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category],
    );
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
      const response = await fetch('/api/email-cases', {
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
      <aside className="flex w-full shrink-0 flex-col border-r border-[#303030] md:w-[310px] lg:w-[360px] xl:w-[400px]">
        <header className="border-b border-[#303030] p-4">
          <h1 className="mb-4 text-lg font-semibold">Email cases</h1>

          <div className="flex items-center gap-3 rounded-full bg-[#303030] px-4 py-3">
            <span className="text-gray-400" aria-hidden="true">⌕</span>
            <span className="text-sm text-gray-400">Search a subject</span>
          </div>

          <div className="mt-4 flex gap-2">
            <span className="rounded-full border border-emerald-700 bg-emerald-900/50 px-4 py-2 text-sm text-emerald-300">
              All
            </span>
            <span className="rounded-full border border-[#383838] px-4 py-2 text-sm text-gray-300">
              NPDP
            </span>
            <span className="rounded-full border border-[#383838] px-4 py-2 text-sm text-gray-300">
              NPS
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="px-4 py-2 text-xs uppercase tracking-wider text-gray-500">
            Recent cases
          </p>

          {cases.map((item) => (
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
        <footer className="sticky bottom-0 border-t border-[#303030] bg-[#111111] p-4">
          <Link
            href="/add-email-case"
            aria-current="page"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <span className="text-xl leading-none" aria-hidden="true">+</span>
            Add email case
          </Link>
          <Link
            href="/"
            className="mt-2 block text-center text-xs text-gray-400 hover:text-white"
          >
            Back to email cases
          </Link>
        </footer>
      </aside>

      {/* Form panel */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[#303030] px-6 py-5 lg:px-8">
          <h2 className="text-xl font-semibold lg:text-2xl">
            Knowledge function
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Create a new email case and record its troubleshooting knowledge.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-4xl space-y-6"
          >
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Email subject <span className="text-red-400">*</span>
              </label>
              <input
                id="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                required
                maxLength={500}
                placeholder="Enter email subject"
                className="w-full rounded-lg border border-[#414141] bg-[#1d1d1d] px-4 py-3 text-sm outline-none transition placeholder:text-gray-500 focus:border-emerald-600"
              />
            </div>

            <div>
              <label
                htmlFor="rootCause"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Root cause
              </label>
              <textarea
                id="rootCause"
                value={rootCause}
                onChange={(event) => setRootCause(event.target.value)}
                rows={5}
                placeholder="Describe the issue, investigation, and root cause..."
                className="w-full resize-y rounded-lg border border-[#414141] bg-[#1d1d1d] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-gray-500 focus:border-emerald-600"
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
              <legend className="mb-3 text-sm font-medium text-gray-200">
                Category <span className="text-red-400">*</span>
              </legend>

              <div className="flex flex-wrap gap-6">
                {['NPS', 'NPDP'].map((category) => (
                  <label
                    key={category}
                    className="flex cursor-pointer items-center gap-3 text-sm text-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="rounded-lg bg-red-950/50 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="rounded-lg bg-emerald-950/50 p-3 text-sm text-emerald-300">
                {success}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-3 border-t border-[#303030] pt-5">
              <Link
                href="/"
                className="rounded-lg border border-[#414141] px-5 py-3 text-sm text-gray-300 hover:bg-[#252525]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
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
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-gray-200">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#505050] text-xl text-gray-200 transition hover:border-emerald-600 hover:bg-emerald-900/40"
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
              <label className="mb-1 block text-xs text-gray-500">
                {title} #{index + 1}
              </label>
            )}

            <textarea
              value={entry.text}
              onChange={(event) => onChange(entry.id, event.target.value)}
              rows={3}
              placeholder={`Enter ${title.toLowerCase()}...`}
              className="w-full resize-y rounded-lg border border-[#414141] bg-[#1d1d1d] px-4 py-3 text-sm leading-6 outline-none placeholder:text-gray-500 focus:border-emerald-600"
            />
          </div>
        ))}
      </div>
    </section>
  );
}