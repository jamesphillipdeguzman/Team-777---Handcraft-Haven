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

// DELETE /api/wishlist/[productId] - Remove a product from the wishlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { productId } = await params;
    const productIdNum = parseInt(productId, 10);

    if (isNaN(productIdNum)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Delete from wishlist
    const result = await sql`
      DELETE FROM wishlist_items
      WHERE user_id = ${user.id} AND product_id = ${productIdNum}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Item not found in wishlist' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/wishlist/[productId] - Check if a product is in the wishlist
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ inWishlist: false });
    }

    const { productId } = await params;
    const productIdNum = parseInt(productId, 10);

    if (isNaN(productIdNum)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const result = await sql`
      SELECT id FROM wishlist_items
      WHERE user_id = ${user.id} AND product_id = ${productIdNum}
    `;

    return NextResponse.json({ inWishlist: result.length > 0 });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
