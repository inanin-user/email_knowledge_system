import { NextRequest, NextResponse } from "next/server";
import  db  from "@/lib/db";
import { CategoryRow } from "@/types/category";
import { isAdmin } from "@/lib/auth-utils";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const adminUser = isAdmin(token);

    const [rows] = await db.execute<CategoryRow[]>(
      `SELECT tag
       FROM category_tag
       ORDER BY tag ASC`
    );
    return NextResponse.json({
      success: true,
      data: rows.map((row) => row.tag),
      isAdmin: adminUser,
    });
  } catch (error) {
    console.error("GET category-tags error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch categories.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify administrator
    const token = request.cookies.get("auth_token")?.value;

    if (!isAdmin(token)) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // 2. Read and validate category name
    const body = await request.json();
    const tag = typeof body.tag === "string" ? body.tag.trim() : "";

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required.",
        },
        { status: 400 }
      );
    }

    if (tag.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name cannot exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    // 3. Insert category
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO category_tag (tag) VALUES (?)`,
      [tag]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category added successfully.",
        data: {
          id: result.insertId,
          tag,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Duplicate category
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This category already exists.",
        },
        { status: 409 }
      );
    }

    console.error("POST category-tags error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to add category.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!isAdmin(token)) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const tag = typeof body.tag === "string" ? body.tag.trim() : "";

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required.",
        },
        { status: 400 }
      );
    }

    

    const [existing] = await db.execute<RowDataPacket[]>(
        `SELECT 1 FROM information_case_tags WHERE tag = ? LIMIT 1`,
        [tag]
    );

    if (existing.length > 0) {
    return NextResponse.json(
        {
        success: false,
        message: "This category is already assigned to information cases and cannot be deleted.",
        },
        { status: 409 }
    );
    }

    const [result] = await db.execute<ResultSetHeader>(
        `DELETE FROM category_tag WHERE tag = ?`,
        [tag]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
      data: { tag },
    });
  } catch (error) {
    console.error("DELETE category-tags error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete category.",
      },
      { status: 500 }
    );
  }
}