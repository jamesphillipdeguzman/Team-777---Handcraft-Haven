"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  artisan_name: string | null;
  image_url: string | null;
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = use(searchParams);
  const query = resolvedParams.q || "";
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      fetch(`/api/products?search=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data.products || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Search Products</h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for handcrafted items..."
                className="flex-1 px-4 py-2 border border-input rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit">Search</Button>
            </form>
          </div>

          {/* Results */}
          {query ? (
            <>
              <div className="mb-4 text-muted-foreground">
                {loading
                  ? "Searching..."
                  : `${products.length} result${products.length !== 1 ? "s" : ""} for "${query}"`}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg aspect-square mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-5 bg-muted rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      artisan_name={product.artisan_name}
                      image_url={product.image_url}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto mb-4 text-muted-foreground"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <p className="text-lg text-muted-foreground">
                    No products found for &quot;{query}&quot;
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try different keywords or browse all products
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/products")}
                  >
                    Browse All Products
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-4 text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <p className="text-lg text-muted-foreground">
                Enter a search term to find products
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/products")}
              >
                Browse All Products
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
