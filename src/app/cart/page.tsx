"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/CartItem";
import { CartSummary } from "@/components/CartSummary";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { cart, clearCart, getCartCount } = useCart();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Shopping Cart</h1>
              <p className="text-muted-foreground mt-1">
                {getCartCount()} {getCartCount() === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            {cart.length > 0 && (
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
            )}
          </div>

          {cart.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven&apos;t added any items yet.
              </p>
              <Link href="/products">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            /* Cart Content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg border border-border p-4">
                  {cart.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>

                {/* Continue Shopping Link */}
                <Link
                  href="/products"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mt-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <CartSummary />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
