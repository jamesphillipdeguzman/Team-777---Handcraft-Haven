import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { artisan_id, name, description, price } = body;

        if (!artisan_id || !name || !price) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 }
            );
        }

        const result = await sql`
      INSERT INTO products (artisan_id, name, description, price)
      VALUES (${artisan_id}, ${name}, ${description}, ${price})
      RETURNING *;
    `;

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
