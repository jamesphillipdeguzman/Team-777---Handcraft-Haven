import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId: productIdParam } = await params;
        const productId = Number(productIdParam);
        if (isNaN(productId)) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        const body = await request.json();
        const { name, description, price, categoryIds } = body;

        if (!name || !description || isNaN(Number(price))) {
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }

        // Update product info
        const updatedProducts = await sql`
      UPDATE products
      SET name = ${name}, description = ${description}, price = ${Number(price)}
      WHERE id = ${productId}
      RETURNING *;
    `;
        const updatedProduct = updatedProducts[0];

        // Update categories if provided
        if (Array.isArray(categoryIds)) {
            // Delete old categories
            await sql`DELETE FROM product_categories WHERE product_id = ${productId};`;

            // Insert new categories
            await Promise.all(
                categoryIds.map((catId: number) =>
                    sql`
            INSERT INTO product_categories (product_id, category_id)
            VALUES (${productId}, ${catId})
            ON CONFLICT (product_id, category_id) DO NOTHING;
          `
                )
            );
        }

        return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });
    } catch (err) {
        console.error('Error updating product:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
