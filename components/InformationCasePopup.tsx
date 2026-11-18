"use client";

import MarkdownContent from "@/components/MarkdownContent";

type CaseMessage = {
  id: number;
  type: string;
  sender: string | null;
  body: string;
  sentAt: string | Date | null;
};

type InformationCase = {
  id: number;
  subject: string;
  emailDate: string | Date;
  category: string[] | string | null;
  rootCause: string | null;
  status: string;
  messages: CaseMessage[];
};

type Props = {
  item: InformationCase;
  onClose: () => void;
};

function formatMessageDate(value: string | Date | null) {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

function getCategories(category: InformationCase["category"]): string[] {
  if (Array.isArray(category)) {
    return category.filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );
  }

  if (typeof category === "string" && category.trim()) {
    try {
      const parsed: unknown = JSON.parse(category);

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        );
      }
    } catch {
      // Support legacy plain-string category values.
    }

    return [category.trim()];
  }

  return [];
}

function formatDate(value: string | Date) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString();
}

export default function InformationCasePopup({ item, onClose }: Props) {
  const categories = getCategories(item.category);

  const caseFields = [
    { label: "Subject", value: item.subject || "—" },
    { label: "Email date", value: formatDate(item.emailDate) },
    { label: "Status", value: item.status || "—" },
    {
      label: "Category",
      value: categories.length > 0 ? categories.join(", ") : "No category",
    },
  ];

  const messages = [...(item.messages ?? [])].sort((a, b) => {
    const dateA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
    const dateB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="information-case-popup-title"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#edf0f5] px-6 py-4">
          <div className="min-w-0">

            <h2
              id="information-case-popup-title"
              className="mt-1 text-lg font-semibold text-[#30354b]"
            >
              {item.subject}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close popup"
            className="ml-4 rounded-md px-3 py-1 text-xl text-[#9298aa] transition hover:bg-[#f0eef8] hover:text-[#71639a]"
          >
            &times;
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
          {/* Case information */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#30354b]">
              Case information
            </h3>

            <div className="overflow-hidden rounded-lg border border-[#edf0f5]">
              {caseFields.map((field) => (
                <div
                  key={field.label}
                  className="grid grid-cols-1 border-b border-[#edf0f5] last:border-b-0 sm:grid-cols-[160px_1fr]"
                >
                  <div className="bg-[#f8f9fc] px-4 py-3 text-sm font-medium text-[#69718a]">
                    {field.label}
                  </div>

                  <div className="break-words px-4 py-3 text-sm text-[#30354b]">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Root cause */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#30354b]">
              Root cause
            </h3>

            <div className="rounded-lg border border-[#edf0f5] bg-[#fafbfe] p-4">
              {item.rootCause?.trim() ? (
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#30354b]">
                  {item.rootCause}
                </p>
              ) : (
                <p className="text-sm text-[#9298aa]">No root cause provided.</p>
              )}
            </div>
          </section>

          {/* Messages */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#30354b]">
                Messages
              </h3>

              <span className="text-xs text-[#9298aa]">
                {messages.length} message{messages.length === 1 ? "" : "s"}
              </span>
            </div>

            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isUser = message.type === "user";

                  return (
                    <article
                      key={message.id}
                      className={`rounded-lg border p-4 ${
                        isUser
                          ? "border-[#dce9e4] bg-[#f5faf7]"
                          : "border-[#e5e1f0] bg-[#faf9fd]"
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-semibold ${
                              isUser
                                ? "bg-[#e1f0e8] text-[#28734d]"
                                : "bg-[#f0eef8] text-[#71639a]"
                            }`}
                          >
                            {message.sender || (isUser ? "User" : "iN")}
                          </span>

                          <span className="text-xs text-[#9298aa]">
                            {message.type}
                          </span>
                        </div>

                        <time className="text-xs text-[#9298aa]">
                          {formatMessageDate(message.sentAt)}
                        </time>
                      </div>

                      <MarkdownContent content={message.body ?? ""} />
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#d9dce7] p-8 text-center text-sm text-[#9298aa]">
                No messages available.
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#edf0f5] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#123B32] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#1b5144]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}