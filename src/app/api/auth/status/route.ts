// src/app/api/auth/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ loggedIn: false });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ loggedIn: false });

        // Fetch user info from database using email
        const users = await sql`SELECT id, email FROM users WHERE id = ${payload.userId}`;
        const user = users[0];

        if (!user) return NextResponse.json({ loggedIn: false });

        // Use email prefix as username
        const username = user.email.split("@")[0];

        return NextResponse.json({
            loggedIn: true,
            user: {
                id: user.id,
                username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error checking auth status:", error);
        return NextResponse.json({ loggedIn: false }, { status: 500 });
    }
}
