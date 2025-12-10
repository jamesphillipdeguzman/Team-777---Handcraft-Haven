import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/products/[productId]/related - Get related products by same category
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

        const { searchParams } = new URL(request.url);
        const limit = Math.min(Number(searchParams.get('limit')) || 4, 12);

        // Get products that share at least one category with the current product
        // Ordered by how many categories they share (most relevant first)
        const relatedProducts = await sql`
            SELECT DISTINCT
                p.id,
                p.name,
                p.description,
                p.price,
                p.created_at,
                a.name as artisan_name,
                (
                    SELECT image_url FROM product_images pi
                    WHERE pi.product_id = p.id
                    ORDER BY pi.is_primary DESC, pi.created_at ASC
                    LIMIT 1
                ) as image_url,
                COUNT(pc2.category_id) as shared_categories
            FROM products p
            LEFT JOIN artisans a ON p.artisan_id = a.id
            JOIN product_categories pc2 ON p.id = pc2.product_id
            WHERE pc2.category_id IN (
                SELECT category_id FROM product_categories WHERE product_id = ${id}
            )
            AND p.id != ${id}
            GROUP BY p.id, p.name, p.description, p.price, p.created_at, a.name
            ORDER BY shared_categories DESC, p.created_at DESC
            LIMIT ${limit}
        `;

        return NextResponse.json({ products: relatedProducts });
    } catch (error) {
        console.error('Failed to fetch related products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch related products' },
            { status: 500 }
        );
    }
}
