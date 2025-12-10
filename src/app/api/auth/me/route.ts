import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sql } from '@/lib/db';
import { hashPassword, comparePassword } from '@/lib/hash';
import { profileUpdateSchema, changePasswordSchema, formatZodError } from '@/lib/validations';

type TokenPayload = { userId: number; email?: string; iat?: number; exp?: number } | null;

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    if (!token) return NextResponse.json({ user: null });

    const payload = verifyToken(token) as TokenPayload;
    if (!payload) return NextResponse.json({ user: null });

    try {
        // Fetch user with optional artisan data
        // Note: The users table may not have a 'name' column yet
        // We'll try to select it but handle gracefully if it doesn't exist
        const rows = await sql`
            SELECT
                u.id,
                u.email,
                u.created_at,
                a.id as artisan_id,
                a.name as artisan_name,
                a.bio as artisan_bio,
                a.profile_image as artisan_profile_image
            FROM users u
            LEFT JOIN artisans a ON a.user_id = u.id
            WHERE u.id = ${payload.userId}
        `;

        if (!rows[0]) {
            return NextResponse.json({ user: null });
        }

        const row = rows[0];
        const user = {
            id: row.id,
            email: row.email,
            name: row.name || null, // May not exist in older schemas
            created_at: row.created_at,
            isArtisan: !!row.artisan_id,
            artisan: row.artisan_id ? {
                id: row.artisan_id,
                name: row.artisan_name,
                bio: row.artisan_bio,
                profile_image: row.artisan_profile_image
            } : null
        };

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error fetching user in /auth/me:", error);
        return NextResponse.json({ user: null }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token) as TokenPayload;
    if (!payload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Handle password change separately
        if (body.type === 'password') {
            const parseResult = changePasswordSchema.safeParse(body);
            if (!parseResult.success) {
                return NextResponse.json(
                    { error: formatZodError(parseResult.error) },
                    { status: 400 }
                );
            }

            const { currentPassword, newPassword } = parseResult.data;

            // Verify current password
            const [user] = await sql`
                SELECT password_hash FROM users WHERE id = ${payload.userId}
            `;

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            const isValid = await comparePassword(currentPassword, user.password_hash);
            if (!isValid) {
                return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
            }

            // Update password
            const hashedPassword = await hashPassword(newPassword);
            await sql`
                UPDATE users
                SET password_hash = ${hashedPassword}
                WHERE id = ${payload.userId}
            `;

            return NextResponse.json({ message: "Password updated successfully" });
        }

        // Handle profile update
        const parseResult = profileUpdateSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: formatZodError(parseResult.error) },
                { status: 400 }
            );
        }

        const { email, artisanName, artisanBio } = parseResult.data;

        // Check if email is already taken by another user
        if (email) {
            const [existingUser] = await sql`
                SELECT id FROM users WHERE email = ${email} AND id != ${payload.userId}
            `;
            if (existingUser) {
                return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
            }

            // Update email if changed
            await sql`
                UPDATE users
                SET email = ${email}
                WHERE id = ${payload.userId}
            `;
        }

        // Note: The users table may not have a 'name' column
        // If you want to add user names, run this SQL:
        // ALTER TABLE users ADD COLUMN name VARCHAR(255);

        // Check if user is an artisan and update artisan info if provided
        const [artisan] = await sql`
            SELECT id FROM artisans WHERE user_id = ${payload.userId}
        `;

        if (artisan && (artisanName !== undefined || artisanBio !== undefined)) {
            await sql`
                UPDATE artisans
                SET
                    name = COALESCE(${artisanName}, name),
                    bio = COALESCE(${artisanBio}, bio)
                WHERE user_id = ${payload.userId}
            `;
        }

        return NextResponse.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


