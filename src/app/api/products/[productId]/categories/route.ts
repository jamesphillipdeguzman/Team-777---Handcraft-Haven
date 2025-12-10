import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId: productIdParam } = await params;
        const productId = Number(productIdParam);
        const body = await request.json();
        const { categoryIds } = body;

        if (!Array.isArray(categoryIds)) {
            return NextResponse.json({ error: 'Invalid categoryIds' }, { status: 400 });
        }

        // Delete existing categories for the product
        await sql`
        DELETE FROM product_categories
        WHERE product_id = ${productId};
    `;

        // Insert new categories
        await Promise.all(
            categoryIds.map((catId: number) =>
                sql`
                INSERT INTO product_categories (product_id, category_id)    
                VALUES (${productId}, ${catId})
                ON CONFLICT (product_id, category_id) DO NOTHING

            `
            )
        );

        return NextResponse.json({ message: "Categories updated" }, { status: 200 });
    } catch (error) {
        console.error('Error updating product categories:', error);
        return NextResponse.json({ error: 'Failed to update product categories' }, { status: 500 });
    }

}


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> } // notice Promise here
) {
    try {
        const { productId } = await params; // <-- await the promise
        const id = Number(productId);

        if (isNaN(id)) {
            return NextResponse.json({ categoryIds: [] }, { status: 400 });
        }

        const rows = await sql`
      SELECT category_id
      FROM product_categories
      WHERE product_id = ${id};
    `;

        const categoryIds = rows.map(row => row.category_id);

        return NextResponse.json({ categoryIds }, { status: 200 });
    } catch (err) {
        console.error('Error fetching product categories:', err);
        return NextResponse.json({ categoryIds: [] }, { status: 500 });
    }
}