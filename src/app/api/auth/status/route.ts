// src/app/api/auth/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const loggedIn = !!(token && verifyToken(token));
    return NextResponse.json({ loggedIn });
}
