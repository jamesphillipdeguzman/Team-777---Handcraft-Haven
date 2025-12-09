"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Loader2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  image_url: string | null;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface Order {
  id: number;
  status: string;
  total: number;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  pending: { icon: Clock, color: "text-yellow-700", bgColor: "bg-yellow-100" },
  processing: { icon: Package, color: "text-blue-700", bgColor: "bg-blue-100" },
  shipped: { icon: Truck, color: "text-purple-700", bgColor: "bg-purple-100" },
  delivered: { icon: CheckCircle, color: "text-green-700", bgColor: "bg-green-100" },
  cancelled: { icon: XCircle, color: "text-red-700", bgColor: "bg-red-100" },
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Order Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Order #{order.id}</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(order.created_at)}
                </span>
                <span>•</span>
                <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-lg">${Number(order.total).toFixed(2)}</p>
            </div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {/* Order Items */}
          <div className="mb-4">
            <h4 className="font-medium text-sm text-gray-700 mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-white rounded-lg p-3 border border-gray-100"
                >
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product_id}`}
                      className="font-medium text-gray-900 hover:text-amber-600 transition-colors line-clamp-1"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h4>
            <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
              <p className="font-medium">{order.shipping_address.name}</p>
              <p className="text-gray-600">{order.shipping_address.street}</p>
              <p className="text-gray-600">
                {order.shipping_address.city}
                {order.shipping_address.state && `, ${order.shipping_address.state}`}{" "}
                {order.shipping_address.zip}
              </p>
              <p className="text-gray-600">{order.shipping_address.country}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="mt-2 text-gray-600">
              View your order history and track shipments
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
              {error}
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchOrders();
                }}
                className="ml-2 text-red-800 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No orders yet
              </h3>
              <p className="mt-2 text-gray-500">
                When you place an order, it will appear here.
              </p>
              <Link href="/products">
                <Button className="mt-4">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
