import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { artisan_id, name, description, price, categoryIds } = body;

        if (!artisan_id || !name || !price) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 }
            );
        }

        // Insert product
        const result = await sql`
      INSERT INTO products (artisan_id, name, description, price)
      VALUES (${artisan_id}, ${name}, ${description}, ${price})
      RETURNING *;
    `;

        const product = result[0];

        // Insert product-category relations
        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
            await Promise.all(
                categoryIds.map((catId: number) =>
                    sql`
          INSERT INTO product_categories (product_id, category_id)
            VALUES (${product.id}, ${catId})
            ON CONFLICT (product_id, category_id) DO NOTHING
        `
                )

            );
        }

        return NextResponse.json(
            { success: true, product: result[0] },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
