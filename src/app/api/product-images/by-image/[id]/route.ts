import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // Set all images of the same product to false
        await sql`
      UPDATE product_images
      SET is_primary = FALSE
      WHERE product_id = (SELECT product_id FROM product_images WHERE id = ${id})
    `;

        // Set the selected image to primary
        await sql`
      UPDATE product_images
      SET is_primary = TRUE
      WHERE id = ${id}
    `;

        return NextResponse.json({ message: 'Primary image updated' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to set primary image' }, { status: 500 });
    }
}
