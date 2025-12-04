"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  image_url: string | null;
}

interface Order {
  id: number;
  status: string;
  total: number;
  shipping_address: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  created_at: string;
  items: OrderItem[];
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        const foundOrder = data.orders?.find(
          (o: Order) => o.id === parseInt(orderId)
        );
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError("Order not found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load order");
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
          <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "We couldn't find your order."}
        </p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We&apos;ll send you a confirmation email shortly.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="font-semibold text-lg">#{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Order Date</p>
            <p className="font-medium">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4 mb-4">
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium capitalize">
            {order.status}
          </span>
        </div>

        {/* Shipping Address */}
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
          <p className="font-medium">{order.shipping_address.name}</p>
          <p className="text-sm text-muted-foreground">
            {order.shipping_address.street}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.shipping_address.city}
            {order.shipping_address.state && `, ${order.shipping_address.state}`}{" "}
            {order.shipping_address.zip}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.shipping_address.country}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h2 className="font-semibold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity} x ${Number(item.price).toFixed(2)}
                </p>
              </div>
              <p className="font-medium">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-4 pt-4">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/account/orders" className="flex-1">
          <Button variant="outline" className="w-full">
            View All Orders
          </Button>
        </Link>
        <Link href="/products" className="flex-1">
          <Button className="w-full">
            Continue Shopping
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-16 text-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
                <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
              </div>
            </div>
          }
        >
          <OrderConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
