import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

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

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const isValid = await isTokenValid(token);

    if (!isValid) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("next", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
