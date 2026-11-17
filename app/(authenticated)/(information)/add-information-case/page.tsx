"use client";

import { withBasePath } from "@/lib/basePath";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CASE_STATUSES,
  getStatusLabel,
  type CaseStatus,
} from "@/types/caseStatus";

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
  status: CaseStatus;
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

export default function AddEmailCasePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [subject, setSubject] = useState("");
  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "All">("All");

  const [cases, setCases] = useState<EmailCase[]>([]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch(withBasePath("/api/information-cases"));
        if (!res.ok) {
          throw new Error(`Failed to fetch cases: ${res.status}`);
        }
        const json = await res.json();
        setCases(json.data);
      } catch (err) {
        console.error("Error fetching information cases:", err);
      }
    };

    fetchCases();
  }, []);

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cases.filter((item) => {
      const matchesCategory =
        activeFilter === "All" || item.category === activeFilter;

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesSearch =
        !query ||
        item.subject.toLowerCase().includes(query) ||
        (item.rootCause ?? "").toLowerCase().includes(query);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [cases, search, activeFilter, statusFilter]);

  const [rootCause, setRootCause] = useState("");
  const [inReplies, setInReplies] = useState<ReplyEntry[]>([
    { id: 1, text: "" },
  ]);
  const [userReplies, setUserReplies] = useState<ReplyEntry[]>([
    { id: 2, text: "" },
  ]);
  const [categories, setCategories] = useState<string[]>(["NPDP"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [emailDate, setEmailDate] = useState("");
  const [status, setStatus] = useState<CaseStatus>("follow_up");
  const [promptEditor, setPromptEditor] = useState<ReplyEntry[]>([
    { id: 1, text: "" },
  ]);
  const [editingCaseId, setEditingCaseId] = useState<number | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  function updateReply(type: "in" | "user", id: number, text: string) {
    const update = (items: ReplyEntry[]) =>
      items.map((item) => (item.id === id ? { ...item, text } : item));

    if (type === "in") {
      setInReplies(update);
    } else {
      setUserReplies(update);
    }
  }

  function addReply(type: "in" | "user") {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const newEntry = { id, text: "" };

    if (type === "in") {
      setInReplies((previous) => [...previous, newEntry]);
    } else {
      setUserReplies((previous) => [...previous, newEntry]);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (categories.length === 0) {
      setCategoryError("Please select at least one category.");
      return;
    }

    setCategoryError("");

    if (!subject.trim()) {
      setError("Please enter an email subject.");
      return;
    }

    if (!categories.length) {
      setError("Please select NPS, NPDP, or both.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = editingCaseId !== null;
      const response = await fetch(
        isEditing
          ? withBasePath(`/api/information-cases/${editingCaseId}`)
          : withBasePath("/api/information-cases"),
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: subject.trim(),
            emailDate: emailDate || null,
            rootCause: rootCause.trim(),
            status,
            categories,
            inReplies: inReplies
              .map((item) => item.text.trim())
              .filter(Boolean),
            userReplies: userReplies
              .map((item) => item.text.trim())
              .filter(Boolean),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save email case.");
      }

      setSuccess(
        isEditing
          ? "Information case updated successfully."
          : "Information case created successfully.",
      );

      // Refresh after successful save
      window.location.reload();

      // Navigate to the case list after a successful save.
      // window.location.assign("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setSaving(false);
    }
  }

  type ReplyEntry = {
    id: number;
    text: string;
  };

  function parseDateFromSubject(subject: string): string {
    const currentYear = new Date().getFullYear();

    // YYMMDD, e.g. 261027 -> 2026-10-27
    const compactDate = subject.match(/(?:^|\D)(\d{2})(\d{2})(\d{2})(?!\d)/);

    if (compactDate) {
      const year = 2000 + Number(compactDate[1]);
      const month = Number(compactDate[2]);
      const day = Number(compactDate[3]);

      if (isValidDate(year, month, day)) {
        return toDateInputValue(year, month, day);
      }
    }

    // MMDD, e.g. 0828 -> August 28 of the current year
    const shortDate = subject.match(/(?:^|\D)(\d{2})(\d{2})(?!\d)/);

    if (shortDate) {
      const month = Number(shortDate[1]);
      const day = Number(shortDate[2]);

      if (isValidDate(currentYear, month, day)) {
        return toDateInputValue(currentYear, month, day);
      }
    }

    // English month names, e.g. Oct 12 or October 12
    const monthDate = subject.match(
      /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})\b/i,
    );

    if (monthDate) {
      const monthNames = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ];

      const month =
        monthNames.findIndex(
          (name) => name === monthDate[1].slice(0, 3).toLowerCase(),
        ) + 1;

      const day = Number(monthDate[2]);

      if (isValidDate(currentYear, month, day)) {
        return toDateInputValue(currentYear, month, day);
      }
    }

    return "";
  }

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      setCategoryError("");

      const response = await fetch(withBasePath("/api/category-tags"), {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load categories.");
      }

      setAvailableCategories(result.data);
      setIsAdmin(result.isAdmin === true);
    } catch (error) {
      console.error("Category loading error:", error);
      setCategoryError(
        error instanceof Error ? error.message : "Unable to load categories.",
      );
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryChange = (category: string) => {
    setCategories((current) => (current.includes(category) ? [] : [category]));
  };

  const handleAddCategory = async () => {
    const tag = newCategory.trim();

    if (!tag || isSavingCategory) return;

    try {
      setIsSavingCategory(true);
      setCategoryError("");

      const response = await fetch(withBasePath("/api/category-tags"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tag }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to add category.");
      }

      // Refresh categories
      await fetchCategories();

      setNewCategory("");
      setIsAddingCategory(false);
    } catch (error) {
      console.error("Add category error:", error);
      setCategoryError(
        error instanceof Error ? error.message : "Unable to add category.",
      );
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete || isDeletingCategory) return;

    try {
      setIsDeletingCategory(true);
      setCategoryError("");

      const response = await fetch(withBasePath("/api/category-tags"), {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tag: categoryToDelete }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete category.");
      }

      // Clear selection if the deleted category was selected
      setCategories((current) =>
        current.filter((category) => category !== categoryToDelete),
      );

      // Refresh categories
      await fetchCategories();

      setCategoryToDelete(null);
    } catch (error) {
      console.error("Delete category error:", error);
      setCategoryError(
        error instanceof Error ? error.message : "Unable to delete category.",
      );
    } finally {
      setIsDeletingCategory(false);
    }
  };

  function isValidDate(year: number, month: number, day: number) {
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }

  function toDateInputValue(year: number, month: number, day: number) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleSubjectChange(value: string) {
    setSubject(value);
    const parsedDate = parseDateFromSubject(value);

    if (parsedDate) {
      setEmailDate(parsedDate);
    }
  }

  function addPrompt() {
    setPromptEditor((previous) => [...previous, { id: Date.now(), text: "" }]);
  }

  function updatePrompt(id: number, text: string) {
    setPromptEditor((previous) =>
      previous.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  }

  function clearForm() {
    setSubject("");
    setEmailDate("");
    setRootCause("");
    setStatus("follow_up");
    setCategories(["NPDP"]);

    setInReplies([{ id: Date.now(), text: "" }]);
    setUserReplies([{ id: Date.now() + 1, text: "" }]);
    setPromptEditor([{ id: Date.now() + 2, text: "" }]);

    setEditingCaseId(null);
    setError("");
    setSuccess("");
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Form panel */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-7 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task name and date */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_190px]">
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Task name <span className="text-red-500">*</span>
              </label>

              <input
                id="subject"
                value={subject}
                onChange={(event) => handleSubjectChange(event.target.value)}
                required
                maxLength={500}
                placeholder="Enter task name"
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-confirm focus:ring-2 focus:ring-confirm/15"
              />
            </div>

            <div>
              <label
                htmlFor="emailDate"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Task date
              </label>

              <input
                id="emailDate"
                type="date"
                value={emailDate}
                onChange={(event) => setEmailDate(event.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-sm text-foreground outline-none transition focus:border-confirm focus:ring-2 focus:ring-confirm/15"
              />
            </div>
          </div>

          {/* Task description */}
          <div>
            <label
              htmlFor="rootCause"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Task description
            </label>

            <textarea
              id="rootCause"
              value={rootCause}
              onChange={(event) => setRootCause(event.target.value)}
              rows={5}
              placeholder="Describe the issue, investigation, and root cause..."
              className="w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-gray-400 focus:border-confirm focus:ring-2 focus:ring-confirm/15"
            />
          </div>

          {/* iN comments */}
          <div className="border-t border-border pt-6">
            <ReplyEditor
              title="iN Comment"
              entries={inReplies}
              onChange={(id, text) => updateReply("in", id, text)}
              onAdd={() => addReply("in")}
              remarks={["follow up", "filename"]}
              onRemarkClick={(remark) => {
                console.log("Selected iN Reply remark:", remark);
              }}
            />
          </div>

          {/* User comments */}
          <div className="border-t border-border pt-6">
            <ReplyEditor
              title="User Comment"
              entries={userReplies}
              onChange={(id, text) => updateReply("user", id, text)}
              onAdd={() => addReply("user")}
              remarks={["finding"]}
              onRemarkClick={(remark) => {
                console.log("Selected User Reply remark:", remark);
              }}
            />
          </div>

          {/* Category */}
          <fieldset className="border-t border-border pt-6">
            <legend className="mb-3 text-sm font-medium text-foreground">
              Category <span className="text-red-500">*</span>
            </legend>

            <div className="flex flex-wrap items-center gap-4">
              {isLoadingCategories ? (
                <p className="text-sm text-muted-foreground">
                  Loading categories...
                </p>
              ) : (
                availableCategories.map((category) => {
                  const isSelected = categories.includes(category);

                  return (
                    <div key={category} className="relative">
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 pr-7 text-sm transition ${
                          isSelected
                            ? "border-confirm bg-confirm/10 text-confirm"
                            : "border-border text-foreground hover:border-confirm hover:bg-confirm/5"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setCategories((current) =>
                              current.includes(category)
                                ? current.filter((item) => item !== category)
                                : [...current, category]
                            );
                          }}
                          className="h-4 w-4 accent-confirm"
                        />

                        <span className="font-medium">{category}</span>
                      </label>

                      {/* Admin delete button */}
                      {isAdmin && (
                        <button
                          type="button"
                          title={`Delete ${category}`}
                          onClick={() => setCategoryToDelete(category)}
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-muted-foreground shadow-sm transition hover:border-red-500 hover:bg-red-500 hover:text-white"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })
              )}

              {/* Admin add category */}
              {isAdmin && (
                <>
                  {isAddingCategory ? (
                    <div
                      className="flex items-center gap-2"
                    >
                      <input
                        autoFocus
                        type="text"
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            setIsAddingCategory(false);
                            setNewCategory("");
                          }
                        }}
                        placeholder="Category name..."
                        maxLength={100}
                        disabled={isSavingCategory}
                        className="w-40 rounded-lg border border-confirm bg-background px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-confirm/30"
                      />

                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim() || isSavingCategory}
                        className="rounded-lg bg-confirm px-3 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSavingCategory ? "..." : "Add"}
                      </button>

                      <button
                        type="button"
                        disabled={isSavingCategory}
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewCategory("");
                        }}
                        className="rounded-lg border border-border px-3 py-3 text-sm text-muted-foreground hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-confirm px-4 py-3 text-sm font-medium text-confirm transition hover:bg-confirm/5"
                    >
                      <span className="text-lg leading-none">+</span>
                      More
                    </button>
                  )}
                </>
              )}
            </div>

            {categoryError && (
              <p className="mt-3 text-sm text-red-500">{categoryError}</p>
            )}
          </fieldset>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as CaseStatus)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-confirm focus:ring-2 focus:ring-confirm/15 sm:max-w-xs"
            >
              {CASE_STATUSES.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {getStatusLabel(statusOption)}
                </option>
              ))}
            </select>
          </div>

          {/* Error and success messages */}
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

          {/* Form actions */}
          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-6">
            <Link
              href="/add-information-case"
              className="rounded-lg bg-cancel px-5 py-2.5 text-sm font-medium text-cancel-foreground transition-colors hover:bg-cancel-hover"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-confirm px-5 py-2.5 text-sm font-semibold text-confirm-foreground transition-colors hover:bg-confirm-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingCaseId
                  ? "Update Information Case"
                  : "Save Information Case"}
            </button>
          </div>
        </form>
        {/* Delete Category Confirmation */}
        {categoryToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl">
              <h3 className="text-base font-semibold text-foreground">
                Delete Category
              </h3>

              <p className="mt-3 text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {categoryToDelete}
                </span>
                ?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeletingCategory}
                  onClick={() => setCategoryToDelete(null)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isDeletingCategory}
                  onClick={handleDeleteCategory}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeletingCategory ? "Deleting..." : "OK"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type ReplyRemark = "follow up" | "filename" | "finding";

function ReplyEditor({
  title,
  entries,
  onChange,
  onAdd,
  remarks = [],
  onRemarkClick,
}: {
  title: string;
  entries: ReplyEntry[];
  onChange: (id: number, text: string) => void;
  onAdd: () => void;
  remarks?: ReplyRemark[];
  onRemarkClick?: (remark: ReplyRemark) => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>

        <div className="flex items-center gap-2">
          {remarks.map((remark) => (
            <button
              key={remark}
              type="button"
              onClick={() => onRemarkClick?.(remark)}
              className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-foreground transition-colors hover:border-selected hover:bg-selected hover:text-selected-foreground"
            >
              {remark}
            </button>
          ))}

          <button
            type="button"
            onClick={onAdd}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xl text-foreground transition-colors hover:border-selected hover:bg-selected hover:text-selected-foreground"
            aria-label={`Add another ${title}`}
            title={`Add another ${title}`}
          >
            +
          </button>
        </div>
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
