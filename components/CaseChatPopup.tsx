
'use client';

import { useState } from 'react';

type ChatMessage = {
    role: 'user' | 'assistant';
    text: string;
};

type CaseChatPopupProps = {
    caseSubject: string;
    status: string;
    statusLabel: string;
};

export default function CaseChatPopup({
    caseSubject,
    status,
    statusLabel,
}: CaseChatPopupProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const normalizedStatus = `${status} ${statusLabel}`.toLowerCase();


    function getAnswer(question: string): string {
        const q = question.toLowerCase();

        const asksConfirmed =
            /\b(confirm|confirmed|confirmation)\b/.test(q);

        const asksClosed =
            /\b(close|closed|closure)\b/.test(q);

        const asksStatus =
            /\b(status|state|progress)\b/.test(q);

        const isConfirmed = /\bconfirm(?:ed|ation)?\b/.test(normalizedStatus);
        const isClosed = /\bclosed\b/.test(normalizedStatus);

        if (asksConfirmed && asksClosed) {
            return [
                `Current status: ${statusLabel}.`,
                `Confirmed: ${isConfirmed ? 'Yes' : 'Not indicated by the current status label'}.`,
                `Closed: ${isClosed ? 'Yes' : 'Not indicated by the current status label'}.`,
            ].join('\n');
        }

        if (asksConfirmed) {
            return isConfirmed
                ? `Yes, the current status indicates that this case is confirmed: ${statusLabel}.`
                : `The current status is "${statusLabel}". Confirmation is not indicated by the current status label.`;
        }

        if (asksClosed) {
            return isClosed
                ? `Yes, this case is marked as closed. Current status: ${statusLabel}.`
                : `The current status is "${statusLabel}". Closure is not indicated by the current status label.`;
        }

        if (asksStatus) {
            return `The current status of "${caseSubject}" is: ${statusLabel}.`;
        }

        return 'Try asking "Is this case confirmed?", "Has it been closed?", or "Is this case confirmed and closed?"';
    }


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const question = input.trim();
        if (!question) return;

        const answer = getAnswer(question);

        setMessages((previous) => [
            ...previous,
            { role: 'user', text: question },
            { role: 'assistant', text: answer },
        ]);

        setInput('');
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-label="Chat about this email case"
                className="inline-flex items-center gap-2 rounded-lg bg-selected px-3 py-2 text-sm font-medium text-selected-foreground transition-colors hover:bg-selected-hover"
            >
                <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10h8M8 14h5m-8 6 3.5-3H17a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v11a3 3 0 0 0 1 2.3Z"
                    />
                </svg>
                {isOpen ? 'Close chat' : 'Ask about case'}
            </button>

            {isOpen && (
                <section
                    aria-label="Email case chat"
                    className="absolute right-0 top-full z-50 mt-2 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-surface text-foreground shadow-xl"
                >
                    <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold">Case assistant</h3>
                            <p className="mt-1 text-xs text-gray-500">
                                Ask about the current case status
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                            className="rounded-md px-2 py-1 text-lg leading-none text-foreground hover:bg-surface-muted"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="max-h-72 min-h-32 space-y-3 overflow-y-auto p-3">
                        <div className="max-w-[90%] rounded-xl bg-surface-muted p-3 text-sm">
                            Hi! I can help check whether this case is confirmed or closed.
                        </div>

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <p
                                    className={`max-w-[90%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm ${message.role === 'user'
                                            ? 'bg-selected text-selected-foreground'
                                            : 'bg-surface-muted text-foreground'
                                        }`}
                                >
                                    {message.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex gap-2 border-t border-border p-3"
                    >
                        <input
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Ask about this case..."
                            aria-label="Your question"
                            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-gray-500 focus:border-selected focus:ring-2 focus:ring-selected/20"
                        />

                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="rounded-lg bg-confirm px-3 py-2 text-sm font-medium text-confirm-foreground transition-colors hover:bg-confirm-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>
                </section>
            )}
        </div>
    );
}