// src/app/api/auth/login/route.ts
import { NextResponse, NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { comparePassword } from "@/lib/hash";
import { signToken } from "@/lib/auth";
import { loginSchema, formatZodError } from "@/lib/validations";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input with Zod
        const parseResult = loginSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: formatZodError(parseResult.error) },
                { status: 400 }
            );
        }

        const { email, password } = parseResult.data;

        const [user] = await sql`SELECT * FROM users WHERE email=${email}`;

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const valid = await comparePassword(password, user.password_hash);
        if (!valid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const [artisan] = await sql`
            SELECT user_id
            FROM artisans
            WHERE user_id = ${user.id}
        `;

        const role = artisan ? "artisan" : "user";

        const token = signToken({ userId: user.id, email: user.email, role });

        const response = NextResponse.json({ message: "Login successful", role });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
