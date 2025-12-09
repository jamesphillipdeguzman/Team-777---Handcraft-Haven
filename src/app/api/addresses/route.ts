import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface Address {
  label?: string;
  name: string;
  street: string;
  city: string;
  state?: string;
  zip: string;
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

// GET /api/addresses - Get all addresses for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const addresses = await sql`
      SELECT id, user_id, label, name, street, city, state, zip, country, is_default, created_at
      FROM addresses
      WHERE user_id = ${user.id}
      ORDER BY is_default DESC, created_at DESC
    `;

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/addresses - Create a new address
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json() as Address;
    const { label, name, street, city, state, zip, country, is_default } = body;

    // Validate required fields
    if (!name || !street || !city || !zip) {
      return NextResponse.json(
        { error: 'Name, street, city, and zip are required' },
        { status: 400 }
      );
    }

    // If this address is set as default, unset any existing default
    if (is_default) {
      await sql`
        UPDATE addresses
        SET is_default = false
        WHERE user_id = ${user.id} AND is_default = true
      `;
    }

    // Check if this is the first address (make it default automatically)
    const existingAddresses = await sql`
      SELECT COUNT(*) as count FROM addresses WHERE user_id = ${user.id}
    `;
    const isFirstAddress = Number(existingAddresses[0].count) === 0;

    const [newAddress] = await sql`
      INSERT INTO addresses (user_id, label, name, street, city, state, zip, country, is_default)
      VALUES (
        ${user.id},
        ${label || null},
        ${name},
        ${street},
        ${city},
        ${state || null},
        ${zip},
        ${country || 'USA'},
        ${is_default || isFirstAddress}
      )
      RETURNING id, user_id, label, name, street, city, state, zip, country, is_default, created_at
    `;

    return NextResponse.json({ address: newAddress }, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
