import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: any;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.userId;

    const user = await sql`
    SELECT id, email, password_hash
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;

    if (user.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = user[0];

    const { newEmail, oldPassword, newPassword } = await req.json();

    try {
        if (newEmail) {
            await sql`
        UPDATE users
        SET email = ${newEmail}
        WHERE id = ${currentUser.id}
      `;
        }

        if (oldPassword && newPassword) {
            const validPassword = await bcrypt.compare(
                oldPassword,
                currentUser.password_hash.toString()
            );

            if (!validPassword) {
                return NextResponse.json({ error: "Wrong password" }, { status: 400 });
            }

            const newHash = await bcrypt.hash(newPassword, 10);

            await sql`
        UPDATE users
        SET password_hash = ${newHash}
        WHERE id = ${currentUser.id}
      `;
        }

        return NextResponse.json({ success: true, message: "Account updated successfully" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}