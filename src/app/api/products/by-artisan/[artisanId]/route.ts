import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ artisanId: string }> }  // <-- note Promise
) {
    const { artisanId } = await params; // unwrap the promise

    console.log("Received artisanId:", artisanId);

    if (!artisanId) {
        return NextResponse.json({ success: false, products: [] });
    }

    try {
        const products = await sql`
        SELECT *
        FROM products
        WHERE artisan_id = ${Number(artisanId)}
        ORDER BY id DESC
      `;
        return NextResponse.json({ success: true, products });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, products: [] });
    }
}
