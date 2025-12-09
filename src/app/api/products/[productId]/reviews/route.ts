import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/db';
import { reviewSchema, formatZodError } from '@/lib/validations';

interface JwtPayload {
    userId: number;
    email: string;
}

// GET /api/products/[productId]/reviews - Get reviews for a product
export async function GET(
    request: Request,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;
        const id = Number(productId);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        // Fetch reviews with user info
        const reviews = await sql`
            SELECT
                r.id,
                r.name,
                r.comment,
                r.star_rating,
                r.created_at,
                r.user_id,
                u.email as user_email
            FROM ratings r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ${id}
            ORDER BY r.created_at DESC
        `;

        // Calculate average rating
        const statsResult = await sql`
            SELECT
                COUNT(*)::int as total_reviews,
                COALESCE(AVG(star_rating), 0)::float as average_rating
            FROM ratings
            WHERE product_id = ${id}
        `;

        const stats = statsResult[0] || { total_reviews: 0, average_rating: 0 };

        return NextResponse.json({
            reviews,
            stats: {
                totalReviews: stats.total_reviews,
                averageRating: Math.round(stats.average_rating * 10) / 10
            }
        });
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

// POST /api/products/[productId]/reviews - Add a review
export async function POST(
    request: Request,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;
        const id = Number(productId);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        // Check authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        let userId: number | null = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
                userId = decoded.userId;
            } catch {
                // Token invalid, allow anonymous review
            }
        }

        const body = await request.json();

        // Validate input with Zod
        const parseResult = reviewSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: formatZodError(parseResult.error) },
                { status: 400 }
            );
        }

        const { name, comment, star_rating } = parseResult.data;

        // Check if product exists
        const productCheck = await sql`SELECT id FROM products WHERE id = ${id}`;
        if (productCheck.length === 0) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check for duplicate review if user is logged in
        if (userId) {
            const existingReview = await sql`
                SELECT id FROM ratings
                WHERE product_id = ${id} AND user_id = ${userId}
            `;
            if (existingReview.length > 0) {
                return NextResponse.json(
                    { error: 'You have already reviewed this product' },
                    { status: 409 }
                );
            }
        }

        // Insert the review
        const result = await sql`
            INSERT INTO ratings (product_id, user_id, name, comment, star_rating)
            VALUES (${id}, ${userId}, ${name}, ${comment}, ${star_rating})
            RETURNING id, name, comment, star_rating, created_at, user_id
        `;

        return NextResponse.json({ review: result[0] }, { status: 201 });
    } catch (error) {
        console.error('Failed to create review:', error);
        return NextResponse.json(
            { error: 'Failed to create review' },
            { status: 500 }
        );
    }
}
