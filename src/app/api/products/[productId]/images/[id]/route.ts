import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(
    req: NextRequest, { params }: { params: Promise<{ id: string, imageId: string }> }) {
    const { id, imageId } = await params;

    const result = await sql`
            DELETE FROM product_images
            WHERE id=${imageId} AND product_id=${id}
            RETURNING *
            `;

    if (result.length === 0) {
        return NextResponse.json({ error: `${imageId} was not found.` }, { status: 404 });
    }
}
