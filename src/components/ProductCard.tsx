"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check } from "lucide-react";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  artisan_name: string | null;
  image_url: string | null;
  description?: string;
}

export function ProductCard({
  id,
  name,
  price,
  artisan_name,
  image_url,
  description,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id,
      name,
      price,
      description: description || "",
      image_url: image_url || undefined,
      artisan_name: artisan_name || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative">
      <Link href={`/products/${id}`}>
        <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">
          <div className="aspect-square relative bg-muted">
            {image_url ? (
              <Image
                src={image_url}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
              {name}
            </h3>
            {artisan_name && (
              <p className="text-sm text-muted-foreground mt-1">by {artisan_name}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <p className="text-lg font-semibold text-foreground">
                ${Number(price).toFixed(2)}
              </p>
              <Button
                size="sm"
                variant={added ? "default" : "outline"}
                className="h-8 w-8 p-0"
                onClick={handleAddToCart}
              >
                {added ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
