/**
 * Derive a short, readable title from a saved troubleshooting prompt.
 * The original prompt is never modified; this title is only for display.
 */
export function extractQuestionTitle(prompt: string): string {
  const text = prompt.trim();
  if (!text) return "Untitled question";

  // Prefer a clearly labelled question section.
  const labelled = text.match(
    /(?:^|\n)\s*(?:main\s+)?question\s*:\s*([\s\S]*?)(?=\n\s*(?:context|requirements|instructions|answer|solution)\s*:|\n{2,}|$)/i
  );

  if (labelled?.[1]?.trim()) {
    return cleanTitle(labelled[1]);
  }

  // Prefer a line that explicitly starts with a question word.
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const questionLine = lines.find((line) =>
    /^(?:question\s*:\s*)?(?:why|how|what|which|when|where|who|can|could|should|would|does|do|did|is|are|was|were|will)\b/i.test(
      line
    )
  );

  if (questionLine) {
    return cleanTitle(questionLine.replace(/^question\s*:\s*/i, ""));
  }

  // Otherwise select the first question-like sentence, excluding fenced code
  // and common technical context labels.
  const withoutCode = text.replace(/```[\s\S]*?```|`[^`]*`/g, " ");
  const sentences = withoutCode.match(/[^.!?\n]+(?:\?+|(?=\n|$))/g) ?? [];
  const question = sentences
    .map((sentence) => sentence.trim())
    .find((sentence) =>
      /^(?:why|how|what|which|when|where|who|can|could|should|would|does|do|did|is|are|was|were|will)\b/i.test(
        sentence
      )
    );

  if (question) return cleanTitle(question);

  // Last-resort fallback: use the first non-empty, non-heading line.
  const firstLine =
    lines.find((line) => !/^(context|schema|requirements|instructions|background)\s*:/i.test(line)) ??
    lines[0];

  return cleanTitle(firstLine ?? text);
}

function cleanTitle(value: string): string {
  const title = value
    .replace(/^[\s"'`#>*-]+/, "")
    .replace(/[\s"'`]+$/, "")
    .replace(/\s+/g, " ")
    .trim();

  const maxLength = 100;
  if (!title) return "Untitled question";
  return title.length > maxLength
    ? `${title.slice(0, maxLength - 1).trimEnd()}…`
    : title;
}
