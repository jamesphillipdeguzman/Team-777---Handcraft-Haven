// POST /api/artisans
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, bio, email, profile_image } = body;

        // assume you have the userId from the session / JWT
        const userId = body.userId;

        const result = await sql`
      INSERT INTO artisans (user_id, name, email, bio, profile_image)
      VALUES (${userId}, ${name}, ${email}, ${bio}, ${profile_image ?? null})
      RETURNING *
    `;

        return NextResponse.json({ success: true, artisan: result[0] });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Failed to create artisan' });
    }
}

// GET /api/artisans
export async function GET() {
    try {
        const artisans = await sql`
        SELECT *
        FROM artisans
        `;
        return NextResponse.json({ success: true, artisans });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Failed to fetch artisans' });
    }
}
