"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchCasePrompts
} from "@/lib/casePrompts";
import { extractQuestionTitle } from "@/lib/extractQuestionTitle";
import PromptDetailPopup from "@/components/PromptDetailPopup";
import { TroubleshootingPromptRow } from "@/types/case";

type KeyQuestionsDropdownProps = {
  caseId: number | string | null;
  /** Optional prompts already returned by the parent case-list API. */
  prompts?: TroubleshootingPromptRow[];
};

export default function KeyQuestionsDropdown({
  caseId,
  prompts: promptsFromParent,
}: KeyQuestionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadedPrompts, setLoadedPrompts] = useState<TroubleshootingPromptRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<TroubleshootingPromptRow | null>(null);

  useEffect(() => {
    setIsOpen(false);
    setSelectedPrompt(null);
    setError("");

    if (caseId === null || caseId === undefined || caseId === "") {
      setLoadedPrompts([]);
      return;
    }

    // Reuse prompts already present in the parent response where possible.
    if (promptsFromParent) {
      setLoadedPrompts(promptsFromParent);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetchCasePrompts(caseId, controller.signal)
      .then(setLoadedPrompts)
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Could not load key questions.");
        setLoadedPrompts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [caseId, promptsFromParent]);

  const questionRows = useMemo(
    () =>
      loadedPrompts.map((prompt) => ({
        prompt,
        title: extractQuestionTitle(prompt.body),
      })),
    [loadedPrompts]
  );

  if (caseId === null || caseId === undefined || caseId === "") return null;

  return (
    <section className="relative z-20 mx-1 my-3 rounded-lg border border-border bg-surface">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left hover:bg-gray-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Prompt List</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {loading ? "…" : questionRows.length}
          </span>
        </span>
        <span aria-hidden="true" className="text-gray-500">
          {isOpen ? "▴" : "▾"}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-border p-2">
          {loading && <p className="px-3 py-2 text-sm text-gray-500">Loading key questions…</p>}
          {error && <p role="alert" className="px-3 py-2 text-sm text-red-600">{error}</p>}
          {!loading && !error && questionRows.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-500">
              No saved prompts for this case.
            </p>
          )}
          {!loading && !error && questionRows.length > 0 && (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {questionRows.map(({ prompt, title }) => (
                <li key={prompt.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedPrompt(prompt)}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-emerald-50 hover:text-emerald-900"
                    title={title}
                  >
                    <span className="block line-clamp-2">{title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <PromptDetailPopup
        prompt={selectedPrompt}
        title={selectedPrompt ? extractQuestionTitle(selectedPrompt.body) : ""}
        onClose={() => setSelectedPrompt(null)}
      />
    </section>
  );
}
