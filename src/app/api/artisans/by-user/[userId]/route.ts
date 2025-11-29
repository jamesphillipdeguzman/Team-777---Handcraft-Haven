import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/artisans/by-user/[userId]
export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;

    try {
        const artisan = await sql`
      SELECT *
      FROM artisans
      WHERE user_id = ${userId}
      LIMIT 1
    `;

        if (artisan.length === 0) {
            return NextResponse.json({ artisan: null });
        }

        return NextResponse.json({ artisan: artisan[0] });
    } catch (err) {
        console.error('Error fetching artisan:', err);
        return NextResponse.json({ error: 'Failed to fetch artisan' }, { status: 500 });
    }
}
