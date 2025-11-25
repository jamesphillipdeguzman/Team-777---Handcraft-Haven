// src/app/api/auth/check-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function isTokenValid(token?: string) {
    if (!token) return false;
    try {
        await jwtVerify(token, encodedSecret);
        return true;
    } catch {
        return false;
    }
}

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const valid = await isTokenValid(token);

    if (!valid) return NextResponse.json({ authorized: false });

    return NextResponse.json({ authorized: true });
}
