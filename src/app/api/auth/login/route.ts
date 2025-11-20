import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { comparePassword } from '@/lib/hash';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const res = await client.query('SELECT * FROM users WHERE email=$1', [email]);
        const user = res.rows[0];

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials!" }, { status: 401 });
        }

        const valid = await comparePassword(password, user.password_hash);
        if (!valid) {
            return NextResponse.json({ error: "Invalid credentials!" }, { status: 401 });
        }

        const token = signToken({ userId: user.id, email: user.email });

        const response = NextResponse.json({ message: "Login successful!", token });

        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}