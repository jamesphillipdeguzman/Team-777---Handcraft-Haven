import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/hash';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password, role, name, bio, profile_image } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // If artisan name is required
        if (role === "artisan" && !name) {
            return NextResponse.json({ error: "Name is required for artisans" }, { status: 400 });
        }

        // Check if user already exists
        const rowsExistingUser = await sql`
            SELECT id 
            FROM users 
            WHERE email=${email}
        `;

        const existingUser = rowsExistingUser[0];

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        // Insert new user into the database
        const [newUser] = await sql`
            INSERT INTO users (email, password_hash) 
            VALUES (${email}, ${hashedPassword}) 
            RETURNING id, email
        `;

        // If role is artisan, insert into artisans table
        if (role === "artisan") {
            await sql`
                INSERT INTO artisans (user_id, name, email, bio, profile_image)
                VALUES (${newUser.id}, ${name}, ${email}, ${bio ?? null}, ${profile_image ?? null})
            `;
        }

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
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
