import { withBasePath } from "@/lib/basePath";
import { TroubleshootingPromptRow } from "@/types/case";


type CaseResponse = {
  prompts?: TroubleshootingPromptRow[];
  message?: string;
};

/**
 * Loads the saved prompts for a case.
 * Assumes GET /api/email-cases/[id] returns { prompts: [...] }.
 */
export async function fetchCasePrompts(
  caseId: number | string,
  signal?: AbortSignal
): Promise<TroubleshootingPromptRow[]> {
  const response = await fetch(
    withBasePath(`/api/email-cases/${encodeURIComponent(String(caseId))}`),
    { method: "GET", cache: "no-store", signal }
  );

  if (!response.ok) {
    throw new Error(`Failed to load prompts for case ${caseId} (${response.status}).`);
  }

  const data = (await response.json()) as CaseResponse;
  return Array.isArray(data.prompts) ? data.prompts : [];
}
