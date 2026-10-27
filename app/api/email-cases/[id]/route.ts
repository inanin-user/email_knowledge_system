
import { NextRequest, NextResponse } from 'next/server';
import type { CaseRow, EmailMessageRow, TroubleshootingPromptRow } from '@/types/case';
import pool from '@/lib/db';


type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Invalid case ID.' },
      { status: 400 },
    );
  }

  try {
    const [caseRows] = await pool.execute<CaseRow[]>(
      `SELECT id, subject, email_date, root_cause, category, status
       FROM email_cases
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    if (!caseRows.length) {
      return NextResponse.json(
        { success: false, message: 'Email case not found.' },
        { status: 404 },
      );
    }

    const [messages] = await pool.execute<EmailMessageRow[]>(
      `SELECT id, message_type AS type, sender_name AS sender,
              body, sent_at
       FROM email_messages
       WHERE case_id = ?
       ORDER BY sent_at ASC, id ASC`,
      [id],
    );

    const [prompts] = await pool.execute<TroubleshootingPromptRow[]>(
      `SELECT id, body
       FROM troubleshooting_prompts
       WHERE case_id = ?
       ORDER BY id ASC`,
      [id],
    );

    const item = caseRows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: item.id,
        subject: item.subject,
        emailDate: item.email_date,
        rootCause: item.root_cause,
        category: item.category,
        status: item.status,
        messages,
        prompts,
      },
    });
  } catch (error) {
    console.error('Failed to fetch email case:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch email case.' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Invalid case ID.' },
      { status: 400 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON request body.' },
      { status: 400 },
    );
  }

  const subject =
    typeof body.subject === 'string' ? body.subject.trim() : '';

  const rootCause =
    typeof body.rootCause === 'string' ? body.rootCause.trim() : '';

  const emailDate =
    typeof body.emailDate === 'string' && body.emailDate
      ? body.emailDate
      : null;

  const validStatuses = [
    'in-progress',
    'confirmed',
    'pending',
    'waiting',
  ];

  const validCategories = ['NPS', 'NPDP'];

  const categories = Array.isArray(body.categories)
    ? body.categories
    : [];

  if (
    !subject ||
    subject.length > 500 ||
    !validStatuses.includes(String(body.status)) ||
    categories.length !== 1 ||
    !validCategories.includes(String(categories[0]))
  ) {
    return NextResponse.json(
      { success: false, message: 'Invalid case fields.' },
      { status: 400 },
    );
  }

  if (
    emailDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(emailDate) ||
      Number.isNaN(Date.parse(`${emailDate}T00:00:00Z`)))
  ) {
    return NextResponse.json(
      { success: false, message: 'Invalid email date.' },
      { status: 400 },
    );
  }

  const stringArray = (value: unknown) =>
    Array.isArray(value)
      ? value.filter(
          (entry): entry is string =>
            typeof entry === 'string' && entry.trim().length > 0,
        ).map((entry) => entry.trim())
      : [];

  const inReplies = stringArray(body.inReplies);
  const userReplies = stringArray(body.userReplies);
  const prompts = stringArray(body.prompts);

  if (inReplies.length + userReplies.length > 100 || prompts.length > 100) {
    return NextResponse.json(
      { success: false, message: 'Too many replies or prompts.' },
      { status: 400 },
    );
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.execute<CaseRow[]>(
      'SELECT id FROM email_cases WHERE id = ? FOR UPDATE',
      [id],
    );

    if (!existing.length) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, message: 'Email case not found.' },
        { status: 404 },
      );
    }

    await connection.execute(
      `UPDATE email_cases
       SET subject = ?, email_date = ?, root_cause = ?,
           category = ?, status = ?
       WHERE id = ?`,
      [
        subject,
        emailDate,
        rootCause || null,
        categories[0],
        body.status,
        id,
      ],
    );

    await connection.execute(
      'DELETE FROM email_case_tags WHERE case_id = ?',
      [id],
    );

    await connection.execute(
      'INSERT INTO email_case_tags (case_id, tag) VALUES (?, ?)',
      [id, categories[0]],
    );

    // Replace editable replies and prompts while preserving other message types.
    await connection.execute(
      `DELETE FROM email_messages
       WHERE case_id = ? AND message_type IN ('user', 'in_reply')`,
      [id],
    );

    for (const message of [
      ...userReplies.map((text) => ({
        type: 'user',
        sender: 'User',
        text,
      })),
      ...inReplies.map((text) => ({
        type: 'in_reply',
        sender: 'iN',
        text,
      })),
    ]) {
      await connection.execute(
        `INSERT INTO email_messages
           (case_id, message_type, sender_name, body, sent_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [id, message.type, message.sender, message.text],
      );
    }

    await connection.execute(
      'DELETE FROM troubleshooting_prompts WHERE case_id = ?',
      [id],
    );

    for (const prompt of prompts) {
      await connection.execute(
        `INSERT INTO troubleshooting_prompts (case_id, body)
         VALUES (?, ?)`,
        [id, prompt],
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Email case updated successfully.',
      data: { id },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to update email case:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to update email case.' },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
