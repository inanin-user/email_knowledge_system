// types/case.ts
import { RowDataPacket } from 'mysql2';

export type CaseRow = RowDataPacket & {
  id: number;
  case_number: string | null;
  subject: string;
  email_date: Date | null;
  category: string | null;
  root_cause: string | null;
  status: string;
  message_id: number | null;
  message_type: 'original' | 'user' | 'in_reply' | null;
  sender_name: string | null;
  body: string | null;
  sent_at: Date | null;
};

export type EmailMessageRow = RowDataPacket & {
  id: number;
  case_id: number;
  message_type: 'original' | 'user' | 'in_reply' | null;
  sender_name: string | null;
  sender_email: string | null;
  body: string | null;
  sent_at: Date | null;
};

export type TroubleshootingPromptRow = RowDataPacket & {
  id: number;
  case_id: number;
  body: string | null;
};