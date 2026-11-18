export type CaseMessage = {
  id: number;
  type: string;
  sender: string | null;
  body: string;
  sentAt: string | Date | null;
};

export type InformationCase = {
  id: number;
  subject: string;
  emailDate: string;
  category: string[] | string | null;
  rootCause: string | null;
  status: string;
  messages: CaseMessage[];
};