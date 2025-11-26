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

// GET /api/products
export async function GET() {
    try {
        const products = await sql`
            SELECT id, name
            FROM products
            ORDER BY name
        `;
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