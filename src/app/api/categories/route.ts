import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeCount = searchParams.get('includeCount') === 'true';

        if (includeCount) {
            // Get categories with product counts
            const categories = await sql`
                SELECT
                    c.id,
                    c.name,
                    COUNT(pc.product_id)::int as product_count
                FROM categories c
                LEFT JOIN product_categories pc ON c.id = pc.category_id
                GROUP BY c.id, c.name
                ORDER BY c.name ASC
            `;
            return NextResponse.json({ categories });
        }

        const categories = await sql`SELECT id, name FROM categories ORDER BY name ASC`;
        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
