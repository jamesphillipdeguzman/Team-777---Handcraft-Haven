import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        await sql`DELETE FROM product_images WHERE id = ${id}`;
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
