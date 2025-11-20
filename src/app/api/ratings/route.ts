import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { name, comment, star_rating } = await req.json();

        // Used to check if the fields are empty and throws an error
        if (name == null || comment == null || star_rating == null) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Checks to see the star rating and if it's somehow less than 1 or more than 5 to throw an error
        const starRatingNumber = Number(star_rating);
        if (isNaN(starRatingNumber) || starRatingNumber < 1 || starRatingNumber > 5) {
            return NextResponse.json({ error: "Invalid star rating" }, { status: 400 });
        }

        // This fixes the sequence of Id's just in case they are out of sync
        await pool.query(
            `SELECT setval('ratings_id_seq', COALESCE((SELECT MAX(id) FROM ratings), 0))`
        );

        // This inserts the review to the database
        const result = await pool.query(
            "INSERT INTO ratings (name, comment, star_rating) VALUES ($1, $2, $3) RETURNING *",
            [name, comment, starRatingNumber]
        );

        return NextResponse.json(result.rows[0]);
    } catch (err) {
        console.error("Error inserting rating:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}