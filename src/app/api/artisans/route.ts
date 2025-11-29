// POST /api/artisans
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, bio, email } = body;

        // assume you have the userId from the session / JWT
        const userId = body.userId;

        const result = await sql`
      INSERT INTO artisans (user_id, name, email, bio)
      VALUES (${userId}, ${name}, ${email}, ${bio})
      RETURNING *
    `;

        return NextResponse.json({ success: true, artisan: result[0] });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Failed to create artisan' });
    }
}
