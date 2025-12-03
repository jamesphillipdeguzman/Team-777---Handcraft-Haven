"use client";

import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  artisan_name: string | null;
  image_url: string | null;
}

export function ProductCard({
  id,
  name,
  price,
  artisan_name,
  image_url,
}: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className="group">
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
          <p className="text-lg font-semibold text-foreground mt-2">
            ${Number(price).toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}
