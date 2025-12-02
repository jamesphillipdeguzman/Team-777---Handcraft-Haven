import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';


export async function GET() {
    try {
        const categories = await sql`SELECT id, name FROM categories ORDER BY name ASC`;
        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
