import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> } // params is a Promise
) {
  try {
    // await the params
    const { id } = await context.params;
    const artisanId = Number(id);

    if (isNaN(artisanId)) {
      return NextResponse.json(
        { success: false, error: "Invalid artisan ID" },
        { status: 400 }
      );
    }

    // Fetch artisan
    const artisans = await sql`
      SELECT * FROM artisans WHERE id = ${artisanId}
    `;
    const artisan = artisans[0] ?? null;

    if (!artisan) {
      return NextResponse.json(
        { success: false, error: "Artisan not found" },
        { status: 404 }
      );
    }

    // Fetch products with primary image
    const products = await sql`
      SELECT p.*, pi.image_url
      FROM products p
      LEFT JOIN LATERAL (
          SELECT image_url
          FROM product_images
          WHERE product_id = p.id
          ORDER BY is_primary DESC, id ASC
          LIMIT 1
      ) pi ON TRUE
      WHERE p.artisan_id = ${artisanId}

    `;

    console.log("Products fetched:", products);

    return NextResponse.json({ success: true, artisan, products });
  } catch (err) {
    console.error("Failed to fetch artisan/products", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch artisan/products" },
      { status: 500 }
    );
  }
}
