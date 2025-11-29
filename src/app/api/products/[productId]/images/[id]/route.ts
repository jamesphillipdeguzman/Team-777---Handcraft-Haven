import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string; id: string }> }
) {
    const { productId, id } = await params;

    const result = await sql`
            DELETE FROM product_images
            WHERE id=${id} AND product_id=${productId}
            RETURNING *
            `;

    if (result.length === 0) {
        return NextResponse.json({ error: `Image ${id} was not found.` }, { status: 404 });
    }

    return NextResponse.json({ message: 'Image deleted successfully' });
}
