import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/hash';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await pool.query(
        'SELECT id FROM users WHERE email=$1',
        [email]
    );
    if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    // Insert new user into the database
    const insertRes = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, hashedPassword]
    );

    const newUser = insertRes.rows[0];

    // Optionally, create a JWT token for the new user
    const token = signToken({ userId: newUser.id, email: newUser.email });

    const response = NextResponse.json({ message: "User created successfully", token }, { status: 201 });

    // Set HttpOnly cookie with JWT
    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
}
