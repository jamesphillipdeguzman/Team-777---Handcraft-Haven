import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sql } from '@/lib/db';

type TokenPayload = { userId: number; email?: string; iat?: number; exp?: number } | null;

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    if (!token) return NextResponse.json({ user: null });

    const payload = verifyToken(token) as TokenPayload;
    if (!payload) return NextResponse.json({ user: null });

    try {
        const rows = await sql`SELECT id, email FROM users WHERE id=${payload.userId}`;
        const user = rows[0];
        return NextResponse.json({ user: user || null });
    } catch (error) {
        console.error("Error fetching user in /auth/me:", error);
        return NextResponse.json({ user: null }, { status: 500 });
    }

}


