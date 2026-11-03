export type CaseStatus =
  | "in_progress"
  | "confirmed"
  | "pending"
  | "waiting"
  | "follow_up";

export const CASE_STATUSES: CaseStatus[] = [
  "in_progress",
  "confirmed",
  "pending",
  "waiting",
  "follow_up",
];

const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  waiting: "Waiting",
  confirmed: "Confirmed",
  follow_up: "Follow up",
};

export function getStatusLabel(status: CaseStatus): string {
  return CASE_STATUS_LABELS[status];
}