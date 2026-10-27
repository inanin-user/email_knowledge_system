
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { CaseRow } from '@/types/case';
import type { ResultSetHeader } from 'mysql2';


export async function POST(request: NextRequest) {
  let payload: {
    subject?: unknown;
    rootCause?: unknown;
    categories?: unknown;
    inReplies?: unknown;
    userReplies?: unknown;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON request body.' },
      { status: 400 },
    );
  }

  const subject =
    typeof payload.subject === 'string' ? payload.subject.trim() : '';

  const rootCause =
    typeof payload.rootCause === 'string'
      ? payload.rootCause.trim()
      : '';

  const allowedCategories = ['NPS', 'NPDP'];

  const categories = Array.isArray(payload.categories)
    ? [...new Set(
        payload.categories.filter(
          (value): value is string =>
            typeof value === 'string' &&
            allowedCategories.includes(value),
        ),
      )]
    : [];

  const inReplies = Array.isArray(payload.inReplies)
    ? payload.inReplies
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const userReplies = Array.isArray(payload.userReplies)
    ? payload.userReplies
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  if (!subject || subject.length > 500) {
    return NextResponse.json(
      {
        success: false,
        message: 'Subject is required and must be at most 500 characters.',
      },
      { status: 400 },
    );
  }

  if (!categories.length) {
    return NextResponse.json(
      {
        success: false,
        message: 'Select at least one category: NPS or NPDP.',
      },
      { status: 400 },
    );
  }

  if (
    categories.length !==
    (Array.isArray(payload.categories)
      ? new Set(payload.categories).size
      : 0)
  ) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid category selection.',
      },
      { status: 400 },
    );
  }

  if (
    inReplies.length + userReplies.length > 100 ||
    rootCause.length > 100000
  ) {
    return NextResponse.json(
      { success: false, message: 'The submitted content is too large.' },
      { status: 400 },
    );
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [caseResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO email_cases
        (subject, email_date, category, root_cause, status)
       VALUES (?, NOW(), ?, ?, 'open')`,
      [subject, categories[0], rootCause || null],
    );

    const caseId = caseResult.insertId;

    for (const category of categories) {
      await connection.execute(
        `INSERT INTO email_case_tags (case_id, tag)
         VALUES (?, ?)`,
        [caseId, category],
      );
    }

    const messages = [
      ...inReplies.map((body) => ({
        type: 'in_reply',
        sender: 'iN',
        body,
      })),
      ...userReplies.map((body) => ({
        type: 'user',
        sender: 'User',
        body,
      })),
    ];

    for (const message of messages) {
      await connection.execute(
        `INSERT INTO email_messages
          (case_id, message_type, sender_name, body, sent_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [
          caseId,
          message.type,
          message.sender,
          message.body,
        ],
      );
    }

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: 'Email case created successfully.',
        data: {
          id: caseId,
          subject,
          categories,
          inReplyCount: inReplies.length,
          userReplyCount: userReplies.length,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    await connection.rollback();

    console.error('Failed to create email case:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to create email case.' },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}


export async function GET() {
  try {
    const [rows] = await pool.query<CaseRow[]>(`
      SELECT
        c.id,
        c.subject,
        c.email_date,
        c.category,
        c.root_cause,
        c.status,
        m.id AS message_id,
        m.message_type,
        m.sender_name,
        m.body,
        m.sent_at
      FROM email_cases c
      LEFT JOIN email_messages m
        ON m.case_id = c.id
      ORDER BY
        c.email_date DESC,
        c.id DESC,
        m.sent_at ASC,
        m.id ASC
    `);

    const cases = new Map<number, {
      id: number;
      subject: string;
      emailDate: Date | null;
      category: string | null;
      rootCause: string | null;
      status: string;
      messages: {
        id: number;
        type: string;
        sender: string | null;
        body: string;
        sentAt: Date | null;
      }[];
    }>();

    for (const row of rows) {
      if (!cases.has(row.id)) {
        cases.set(row.id, {
          id: row.id,
          subject: row.subject,
          emailDate: row.email_date,
          category: row.category,
          rootCause: row.root_cause,
          status: row.status,
          messages: [],
        });
      }

      if (row.message_id !== null) {
        cases.get(row.id)!.messages.push({
          id: row.message_id,
          type: row.message_type!,
          sender: row.sender_name,
          body: row.body ?? '',
          sentAt: row.sent_at,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: Array.from(cases.values()),
    });
  } catch (error) {
    console.error('Failed to retrieve email cases:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to retrieve email cases.' },
      { status: 500 },
    );
  }
}
