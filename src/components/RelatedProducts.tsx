"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  artisan_name: string | null;
  image_url: string | null;
  description: string | null;
}

interface RelatedProductsProps {
  productId: number;
  limit?: number;
}

export function RelatedProducts({ productId, limit = 4 }: RelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${productId}/related?limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [productId, limit]);

  if (loading) {
    return (
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-lg mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t border-border pt-8">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            artisan_name={product.artisan_name}
            image_url={product.image_url}
            description={product.description || undefined}
          />
        ))}
      </div>
    </div>
  );
}
