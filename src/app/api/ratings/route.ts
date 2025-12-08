import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const productId = Number(searchParams.get('productId'));

    if (isNaN(productId)) {
        return NextResponse.json({ ratings: [] });
    }

    const ratings = await sql`
        SELECT id, name, comment, star_rating, product_id
        FROM ratings
        WHERE product_id = ${productId}
        ORDER BY id DESC
    `;

    return NextResponse.json({ ratings });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { name, comment, star_rating, product_id } = body;

    if (!name || !comment || !star_rating || !product_id) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const [newRating] = await sql`
        INSERT INTO ratings (name, comment, star_rating, product_id)
        VALUES (${name}, ${comment}, ${star_rating}, ${product_id})
        RETURNING *
    `;

    return NextResponse.json(newRating);
}