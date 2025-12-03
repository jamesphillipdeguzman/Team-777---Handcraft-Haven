import jwt from "jsonwebtoken";
export { hashPassword, comparePassword } from './hash'; // re-export

// Use Node.js runtime instead of Edge
export const runtime = "nodejs";

interface TokenPayload {
    userId: string;
    email: string;
    role: "user" | "artisan";
    iat?: number;
    exp?: number;
}

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return secret;
}


// Sign a JWT token with a payload
export function signToken(payload: object): string {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

// Verify a JWT token and return the decoded payload
export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    } catch (err) {
        return null;
    }
}

// Check if logged in
export function isLoggedIn(token?: string): boolean {
    if (!token) return false;
    return !!verifyToken(token);
}