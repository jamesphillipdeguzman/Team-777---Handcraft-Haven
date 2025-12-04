import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// Helper function to get user from token
async function getUserFromToken(): Promise<{ id: number; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return { id: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { items, shipping_address, total } = body as {
      items: OrderItem[];
      shipping_address: ShippingAddress;
      total: number;
    };

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    if (!shipping_address || !shipping_address.name || !shipping_address.street ||
        !shipping_address.city || !shipping_address.zip) {
      return NextResponse.json({ error: 'Valid shipping address is required' }, { status: 400 });
    }

    if (!total || isNaN(Number(total))) {
      return NextResponse.json({ error: 'Valid total is required' }, { status: 400 });
    }

    // Create the order
    const orders = await sql`
      INSERT INTO orders (user_id, status, total, shipping_address, created_at, updated_at)
      VALUES (${user.id}, 'pending', ${total}, ${JSON.stringify(shipping_address)}, NOW(), NOW())
      RETURNING id, status, total, shipping_address, created_at
    `;

    const order = orders[0];

    // Insert order items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${order.id}, ${item.product_id}, ${item.quantity}, ${item.price})
      `;
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        shipping_address: order.shipping_address,
        created_at: order.created_at,
        items: items
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/orders - Get user's orders
export async function GET() {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const orders = await sql`
      SELECT
        o.id,
        o.status,
        o.total,
        o.shipping_address,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE o.user_id = ${user.id}
      ORDER BY o.created_at DESC
    `;

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await sql`
          SELECT
            oi.id,
            oi.product_id,
            oi.quantity,
            oi.price,
            p.name as product_name,
            (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as image_url
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ${order.id}
        `;
        return { ...order, items };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
