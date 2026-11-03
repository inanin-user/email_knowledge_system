"use client";

import { useEffect } from "react";
import type { TroubleshootingPromptRow } from "@/types/case";

type PromptDetailPopupProps = {
  prompt: TroubleshootingPromptRow  | null;
  title: string;
  onClose: () => void;
};

export default function PromptDetailPopup({
  prompt,
  title,
  onClose,
}: PromptDetailPopupProps) {
  useEffect(() => {
    if (!prompt) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prompt, onClose]);

  if (!prompt) return null;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.body);
    } catch {
      // Clipboard access may be blocked by browser permissions or insecure context.
      window.prompt("Copy the prompt text below:", prompt.body);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        aria-labelledby="prompt-detail-title"
        aria-modal="true"
        role="dialog"
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div className="min-w-0">
            <h2 id="prompt-detail-title" className="text-base font-semibold text-foreground">
              {title}
            </h2>
            <p className="mt-1 text-xs text-gray-500">Full saved prompt</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close prompt details"
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            ✕
          </button>
        </header>

        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-6 text-foreground">
          {prompt.body}
        </pre>

        <footer className="flex justify-end gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-cancel px-4 py-2 text-sm text-cancel-foreground hover:bg-cancel-hover"
          >
            Close
          </button>
          <button
            type="button"
            onClick={copyPrompt}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600"
          >
            Copy prompt
          </button>
        </footer>
      </section>
    </div>
  );
}
