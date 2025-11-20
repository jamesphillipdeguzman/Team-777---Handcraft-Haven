import jwt from "jsonwebtoken";
export { hashPassword, comparePassword } from './hash'; // re-export


// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET!;

// Ensure JWT_SECRET is defined
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not in the environment variables");
}

// Sign a JWT token with a payload
export function signToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify a JWT token and return the decoded payload
export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}