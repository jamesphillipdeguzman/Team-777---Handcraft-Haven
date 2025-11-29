import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
// GET /api/product-images/[productId]
// Fetch images for a specific product
export async function GET(
    req: Request, { params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params;
    const images = await sql`
        SELECT *
        FROM product_images
        WHERE product_id = ${productId}
    `;
    return NextResponse.json({ images });
}

