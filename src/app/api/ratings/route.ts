import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sql } from "@/lib/db";
import { reviewSchema, formatZodError } from "@/lib/validations";

interface JwtPayload {
    userId: number;
    email: string;
}

// GET /api/ratings - Get all ratings (optionally filtered by product_id)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("product_id");

        let rows;
        if (productId) {
            const id = Number(productId);
            if (isNaN(id)) {
                return NextResponse.json(
                    { error: "Invalid product_id" },
                    { status: 400 }
                );
            }
            rows = await sql`
                SELECT r.id, r.name, r.comment, r.star_rating, r.product_id, r.user_id,
                       p.name as product_name
                FROM ratings r
                LEFT JOIN products p ON r.product_id = p.id
                WHERE r.product_id = ${id}
                ORDER BY r.id DESC
            `;
        } else {
            rows = await sql`
                SELECT r.id, r.name, r.comment, r.star_rating, r.product_id, r.user_id,
                       p.name as product_name
                FROM ratings r
                LEFT JOIN products p ON r.product_id = p.id
                ORDER BY r.id DESC
            `;
        }

        return NextResponse.json(rows);
    } catch (err) {
        console.error("Error fetching ratings:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { product_id } = body;

        // Validate input with Zod
        const parseResult = reviewSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: formatZodError(parseResult.error) },
                { status: 400 }
            );
        }

        const { name, comment, star_rating } = parseResult.data;

        // Validate product_id is provided
        if (product_id == null) {
            return NextResponse.json(
                { error: "product_id is required" },
                { status: 400 }
            );
        }

        const productIdNum = Number(product_id);
        if (isNaN(productIdNum) || productIdNum < 1) {
            return NextResponse.json(
                { error: "Invalid product_id" },
                { status: 400 }
            );
        }

        // Check if product exists
        const productCheck = await sql`SELECT id, name FROM products WHERE id = ${productIdNum}`;
        if (productCheck.length === 0) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Check authentication and capture user_id
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        let userId: number | null = null;

        if (token) {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET!
                ) as JwtPayload;
                userId = decoded.userId;
            } catch {
                // Token invalid, allow anonymous review
            }
        }

        // Prevent duplicate reviews per user/product for logged-in users
        if (userId) {
            const existingReview = await sql`
                SELECT id FROM ratings
                WHERE product_id = ${productIdNum} AND user_id = ${userId}
            `;
            if (existingReview.length > 0) {
                return NextResponse.json(
                    { error: "You have already reviewed this product" },
                    { status: 409 }
                );
            }
        }

        // Insert the review with product_id and user_id
        const result = await sql`
            INSERT INTO ratings (name, comment, star_rating, product_id, user_id)
            VALUES (${name}, ${comment}, ${star_rating}, ${productIdNum}, ${userId})
            RETURNING id, name, comment, star_rating, product_id, user_id
        `;

        return NextResponse.json(result[0], { status: 201 });
    } catch (err) {
        console.error("Error inserting rating:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
