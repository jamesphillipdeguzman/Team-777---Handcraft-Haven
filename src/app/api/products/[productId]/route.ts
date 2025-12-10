import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/products/[productId] - Get single product with full details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId: productIdParam } = await params;
        const productId = Number(productIdParam);

        if (isNaN(productId)) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        // Get product with artisan info
        const products = await sql`
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.created_at,
                a.id as artisan_id,
                a.name as artisan_name,
                a.bio as artisan_bio
            FROM products p
            LEFT JOIN artisans a ON p.artisan_id = a.id
            WHERE p.id = ${productId}
        `;

        if (products.length === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const product = products[0];

        // Get product images
        const images = await sql`
            SELECT id, image_url, is_primary
            FROM product_images
            WHERE product_id = ${productId}
            ORDER BY is_primary DESC, created_at ASC
        `;

        // Get product categories
        const categories = await sql`
            SELECT c.id, c.name
            FROM categories c
            JOIN product_categories pc ON c.id = pc.category_id
            WHERE pc.product_id = ${productId}
        `;

        return NextResponse.json({
            product: {
                ...product,
                images,
                categories
            }
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

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

        // Update product
        const updatedProducts = await sql`
      UPDATE products
      SET name = ${name}, description = ${description}, price = ${Number(price)}
      WHERE id = ${productId}
      RETURNING *;
    `;
        const updatedProduct = updatedProducts[0];

        // Update categories
        if (Array.isArray(categoryIds)) {
            await sql`DELETE FROM product_categories WHERE product_id = ${productId};`;

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

        // narrow type for returned rows
        type CategoryRow = { category_id: number };

        // fetch updated category ids and assert type
        const updatedCats = (await sql`
      SELECT category_id
      FROM product_categories
      WHERE product_id = ${productId};
    `) as CategoryRow[];

        const updatedCategoryIds = updatedCats.map(row => row.category_id);

        return NextResponse.json(
            {
                success: true,
                product: {
                    ...updatedProduct,
                    categoryIds: updatedCategoryIds
                }
            },
            { status: 200 }
        );
    } catch (err) {
        console.error('Error updating product:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
