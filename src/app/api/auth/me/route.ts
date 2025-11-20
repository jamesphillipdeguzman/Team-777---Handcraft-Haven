import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';

type TokenPayload = { userId: number; email?: string; iat?: number; exp?: number } | null;

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    if (!token) return NextResponse.json({ user: null });

    const payload = verifyToken(token) as TokenPayload;
    if (!payload) return NextResponse.json({ user: null });

    const res = await pool.query("SELECT id, email FROM users WHERE id=$1", [payload.userId]);
    const user = res.rows[0];

    return NextResponse.json({ user: user || null });
}


