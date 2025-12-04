"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/wishlistContext";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    artisan_name: string | null;
    image_url: string | null;
}

interface Category {
    id: number;
    name: string;
}

function ProductsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToWishlist } = useWishlist();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>(
        searchParams.get("category") || ""
    );
    const [sortBy, setSortBy] = useState<string>(
        searchParams.get("sort") || "newest"
    );

    // Fetch categories on mount
    useEffect(() => {
        fetch("/api/categories")
            .then((res) => res.json())
            .then((data) => setCategories(data.categories || []))
            .catch(console.error);
    }, []);

    // Fetch products when filters change
    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();

        const fetchProducts = async () => {
            const params = new URLSearchParams();
            if (selectedCategory) params.set("category", selectedCategory);
            if (sortBy) params.set("sort", sortBy);

            queueMicrotask(() => {
                if (isMounted && !abortController.signal.aborted) {
                    setLoading(true);
                }
            });

            try {
                const res = await fetch(`/api/products?${params.toString()}`, {
                    signal: abortController.signal
                });
                const data = await res.json();

                if (isMounted) {
                    setProducts(data.products || []);
                    setLoading(false);
                }
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;
                console.error(err);
                if (isMounted) setLoading(false);
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [selectedCategory, sortBy]);

    const updateFilters = (category: string, sort: string) => {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (sort && sort !== "newest") params.set("sort", sort);

        router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        updateFilters(categoryId, sortBy);
    };

    const handleSortChange = (sort: string) => {
        setSortBy(sort);
        updateFilters(selectedCategory, sort);
    };

    const clearFilters = () => {
        setSelectedCategory("");
        setSortBy("newest");
        router.push("/products", { scroll: false });
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Products</h1>
                        <p className="text-muted-foreground">
                            Browse our collection of handcrafted items from talented artisans.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* Category Filter */}
                        <div className="flex-1">
                            <label htmlFor="category" className="block text-sm font-medium mb-2">
                                Category
                            </label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full md:w-auto min-w-[200px] px-3 py-2 bg-card border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label htmlFor="sort" className="block text-sm font-medium mb-2">
                                Sort By
                            </label>
                            <select
                                id="sort"
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="w-full md:w-auto min-w-[180px] px-3 py-2 bg-card border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="name">Name A-Z</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(selectedCategory || sortBy !== "newest") && (
                            <div className="flex items-end">
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
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
                                    onAddToWishlist={() =>
                                        addToWishlist({
                                            id: product.id,
                                            name: product.name,
                                            description: product.description,
                                            price: product.price,
                                            image_url: product.image_url ?? undefined,
                                            artisan_name: product.artisan_name ?? undefined,
                                        })
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-lg text-muted-foreground mb-2">No products found</p>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
