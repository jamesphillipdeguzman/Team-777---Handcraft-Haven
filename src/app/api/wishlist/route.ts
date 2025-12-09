import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Helper function to get user from token
async function getUserFromToken(req: NextRequest): Promise<{ id: number; email: string } | null> {
  const token = req.cookies.get('token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return { id: Number(payload.userId), email: payload.email || '' };
}

// GET /api/wishlist - Get all wishlist items for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const wishlistItems = await sql`
      SELECT
        w.id,
        w.product_id,
        w.created_at,
        p.name,
        p.description,
        p.price,
        a.name as artisan_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as image_url,
        (SELECT c.name FROM categories c
         JOIN product_categories pc ON c.id = pc.category_id
         WHERE pc.product_id = p.id LIMIT 1) as category
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN artisans a ON p.artisan_id = a.id
      WHERE w.user_id = ${user.id}
      ORDER BY w.created_at DESC
    `;

    // Transform to match the Product type used in the frontend
    const items = wishlistItems.map(item => ({
      id: item.product_id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      image_url: item.image_url,
      category: item.category,
      artisan_name: item.artisan_name,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/wishlist - Add a product to the wishlist
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { product_id } = body as { product_id: number };

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Verify product exists
    const products = await sql`SELECT id FROM products WHERE id = ${product_id}`;
    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if already in wishlist
    const existing = await sql`
      SELECT id FROM wishlist_items
      WHERE user_id = ${user.id} AND product_id = ${product_id}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ message: 'Product already in wishlist' }, { status: 200 });
    }

    // Add to wishlist
    await sql`
      INSERT INTO wishlist_items (user_id, product_id)
      VALUES (${user.id}, ${product_id})
    `;

    return NextResponse.json({ success: true, message: 'Added to wishlist' }, { status: 201 });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/wishlist - Remove a product from wishlist (alternative to /api/wishlist/[productId])
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await sql`
      DELETE FROM wishlist_items
      WHERE user_id = ${user.id} AND product_id = ${parseInt(productId, 10)}
    `;

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
