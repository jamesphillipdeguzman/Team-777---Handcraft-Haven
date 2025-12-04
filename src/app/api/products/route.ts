import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
// import type { UploadApiResponse } from 'cloudinary';
import { sql } from '@/lib/db';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudApiKey = process.env.CLOUDINARY_API_KEY;
const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !cloudApiKey || !cloudApiSecret) {
    throw new Error('Cloudinary environment variables are not configured');
}
cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudApiKey,
    api_secret: cloudApiSecret,
});
export const runtime = 'nodejs';

// GET /api/products - Get all products with optional filtering
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('category');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'newest';

        // Build the base query with product info, primary image, and artisan
        let products;

        if (categoryId) {
            products = await sql`
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
                    ) as image_url
                FROM products p
                LEFT JOIN artisans a ON p.artisan_id = a.id
                JOIN product_categories pc ON p.id = pc.product_id
                WHERE pc.category_id = ${Number(categoryId)}
                ORDER BY p.created_at DESC
            `;
        } else if (search) {
            const searchPattern = `%${search}%`;
            products = await sql`
                SELECT
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
                    ) as image_url
                FROM products p
                LEFT JOIN artisans a ON p.artisan_id = a.id
                WHERE p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern}
                ORDER BY p.created_at DESC
            `;
        } else {
            // Validate sort parameter against whitelist to prevent SQL injection
            const allowedSorts = ['newest', 'oldest', 'price_low', 'price_high', 'name'];
            const validatedSort = allowedSorts.includes(sort) ? sort : 'newest';

            // Default: get all products with safe ORDER BY based on validated sort
            // Using separate complete queries for each sort option to prevent SQL injection
            switch (validatedSort) {
                case 'oldest':
                    products = await sql`
                        SELECT
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
                            ) as image_url
                        FROM products p
                        LEFT JOIN artisans a ON p.artisan_id = a.id
                        ORDER BY p.created_at ASC
                    `;
                    break;
                case 'price_low':
                    products = await sql`
                        SELECT
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
                            ) as image_url
                        FROM products p
                        LEFT JOIN artisans a ON p.artisan_id = a.id
                        ORDER BY p.price ASC
                    `;
                    break;
                case 'price_high':
                    products = await sql`
                        SELECT
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
                            ) as image_url
                        FROM products p
                        LEFT JOIN artisans a ON p.artisan_id = a.id
                        ORDER BY p.price DESC
                    `;
                    break;
                case 'name':
                    products = await sql`
                        SELECT
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
                            ) as image_url
                        FROM products p
                        LEFT JOIN artisans a ON p.artisan_id = a.id
                        ORDER BY p.name ASC
                    `;
                    break;
                case 'newest':
                default:
                    products = await sql`
                        SELECT
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
                            ) as image_url
                        FROM products p
                        LEFT JOIN artisans a ON p.artisan_id = a.id
                        ORDER BY p.created_at DESC
                    `;
                    break;
            }
        }

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// Additional methods (POST, DELETE, etc.) can be added here as needed.

export async function POST(request: Request) {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const images = formData.getAll('images') as File[];
    if (!name || !description || !price || images.length === 0) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }
    try {
        const result = await sql`
            INSERT INTO products (name, description, price)
            VALUES (${name}, ${description}, ${price})
            RETURNING id
        `;
        const productId = result[0].id;
        for (const image of images) {
            // Read the image as a buffer
            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Convert buffer to base64 and create a data URI
            const mimeType = image.type || 'application/octet-stream';
            const base64 = buffer.toString('base64');
            const dataUri = `data:${mimeType};base64,${base64}`;

            const uploadResult = await cloudinary.uploader.upload(dataUri, {
                folder: 'product_images',
            });
            await sql`
                INSERT INTO product_images (product_id, image_url)
                VALUES (${productId}, ${uploadResult.secure_url})
            `;
        }
        return NextResponse.json({ success: true, productId });
    } catch (error) {
        console.error('Failed to add product:', error);
        return NextResponse.json(
            { error: 'Failed to add product' },
            { status: 500 }
        );
    }
}