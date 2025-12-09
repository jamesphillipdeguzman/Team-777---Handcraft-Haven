import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface AddressUpdate {
  label?: string;
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  is_default?: boolean;
}

// Helper function to get user from token
async function getUserFromToken(req: NextRequest): Promise<{ id: number; email: string } | null> {
  const token = req.cookies.get('token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return { id: Number(payload.userId), email: payload.email || '' };
}

// GET /api/addresses/[id] - Get a specific address
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const addressId = parseInt(id, 10);

    if (isNaN(addressId)) {
      return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 });
    }

    const addresses = await sql`
      SELECT id, user_id, label, name, street, city, state, zip, country, is_default, created_at
      FROM addresses
      WHERE id = ${addressId} AND user_id = ${user.id}
    `;

    if (addresses.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ address: addresses[0] });
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/addresses/[id] - Update an address
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const addressId = parseInt(id, 10);

    if (isNaN(addressId)) {
      return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 });
    }

    // Check if address exists and belongs to user
    const existing = await sql`
      SELECT id FROM addresses WHERE id = ${addressId} AND user_id = ${user.id}
    `;

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const body = await req.json() as AddressUpdate;
    const { label, name, street, city, state, zip, country, is_default } = body;

    // Validate required fields if provided
    if (name !== undefined && !name) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }
    if (street !== undefined && !street) {
      return NextResponse.json({ error: 'Street cannot be empty' }, { status: 400 });
    }
    if (city !== undefined && !city) {
      return NextResponse.json({ error: 'City cannot be empty' }, { status: 400 });
    }
    if (zip !== undefined && !zip) {
      return NextResponse.json({ error: 'ZIP code cannot be empty' }, { status: 400 });
    }

    // If setting as default, unset any existing default
    if (is_default) {
      await sql`
        UPDATE addresses
        SET is_default = false
        WHERE user_id = ${user.id} AND is_default = true AND id != ${addressId}
      `;
    }

    // Build dynamic update query
    const [updatedAddress] = await sql`
      UPDATE addresses
      SET
        label = COALESCE(${label ?? null}, label),
        name = COALESCE(${name ?? null}, name),
        street = COALESCE(${street ?? null}, street),
        city = COALESCE(${city ?? null}, city),
        state = COALESCE(${state ?? null}, state),
        zip = COALESCE(${zip ?? null}, zip),
        country = COALESCE(${country ?? null}, country),
        is_default = COALESCE(${is_default ?? null}, is_default)
      WHERE id = ${addressId} AND user_id = ${user.id}
      RETURNING id, user_id, label, name, street, city, state, zip, country, is_default, created_at
    `;

    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/addresses/[id] - Delete an address
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const addressId = parseInt(id, 10);

    if (isNaN(addressId)) {
      return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 });
    }

    // Check if address exists and belongs to user
    const existing = await sql`
      SELECT id, is_default FROM addresses WHERE id = ${addressId} AND user_id = ${user.id}
    `;

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const wasDefault = existing[0].is_default;

    // Delete the address
    await sql`DELETE FROM addresses WHERE id = ${addressId} AND user_id = ${user.id}`;

    // If the deleted address was default, set another one as default
    if (wasDefault) {
      await sql`
        UPDATE addresses
        SET is_default = true
        WHERE user_id = ${user.id}
        AND id = (SELECT id FROM addresses WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1)
      `;
    }

    return NextResponse.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
