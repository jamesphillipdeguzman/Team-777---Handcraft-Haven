import { NextResponse, NextRequest } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(
    req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { body } = await req.json();
    const { imageId } = body;

    if (!imageId) {
        return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    // Set all images for the product to not primary
    await sql`
            UPDATE product_images
            SET is_primary = FALSE
            WHERE product_id = ${id}
        `;

    // Set the specified image as primary
    const result = await sql`
            UPDATE product_images
            SET is_primary = TRUE
            WHERE id = {imageId} AND product_id = ${id}
            RETURNING *
        `;
    if (result.length === 0) {
        return NextResponse.json({ error: `Image with ID ${imageId} not found for product ${id}` }, { status: 404 })
    }
    return NextResponse.json({ success: true, image: result[0] });


}
