import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// DELETE /api/product-images/by-image/[id]
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        await sql`DELETE FROM product_images WHERE id = ${id}`;
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
