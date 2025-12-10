'use client';

import { useWishlist } from "@/context/wishlistContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag, Loader2 } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="mt-2 text-gray-600">
            Items you&apos;ve saved for later
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : wishlist.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Your wishlist is empty
            </h3>
            <p className="mt-2 text-gray-500">
              Start adding products you love to your wishlist.
            </p>
            <Link href="/products">
              <Button className="mt-4 gap-2">
                <ShoppingBag className="h-4 w-4" />
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square relative bg-gray-100">
                    <Image
                      src={product.image_url ?? "/placeholder.png"}
                      alt={product.name ?? "Product Image"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h2 className="text-lg font-semibold text-gray-900 hover:text-amber-600 transition-colors line-clamp-1">
                      {product.name}
                    </h2>
                  </Link>

                  {product.category && (
                    <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                  )}

                  {product.artisan_name && (
                    <p className="text-sm text-gray-500">by {product.artisan_name}</p>
                  )}

                  <p className="text-lg font-bold text-green-600 mt-2">
                    ${Number(product.price).toFixed(2)}
                  </p>

                  {product.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFromWishlist(product.id)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
