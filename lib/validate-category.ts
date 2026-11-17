import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";

interface CategoryRow extends RowDataPacket {
  tag: string;
}

export async function validateCategories(
  categories: unknown
): Promise<string[]> {
  if (
    !Array.isArray(categories) ||
    categories.length === 0 ||
    !categories.every(
      (item) => typeof item === "string" && item.trim().length > 0
    )
  ) {
    throw new Error("At least one valid category is required.");
  }

  const selected = [
    ...new Set(categories.map((item: string) => item.trim())),
  ];

  const placeholders = selected.map(() => "?").join(", ");

  const [rows] = await pool.execute<CategoryRow[]>(
    `SELECT tag FROM category_tag WHERE tag IN (${placeholders})`,
    selected
  );

  if (rows.length !== selected.length) {
    throw new Error("One or more selected categories are invalid.");
  }

  return selected;
}