import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET /api/artisans/[id]
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // unwrap the params Promise

    const rows = await sql`
      SELECT *
      FROM artisans
      WHERE id = ${id}
    `;

    const artisan = rows[0] ?? null;

    if (!artisan) {
      return NextResponse.json(
        { success: false, error: "Artisan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, artisan });
  } catch (err) {
    console.error("Failed to fetch artisan", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch artisan" },
      { status: 500 }
    );
  }
}