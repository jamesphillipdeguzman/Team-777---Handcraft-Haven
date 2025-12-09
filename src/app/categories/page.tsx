"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Palette,
  Gem,
  Trees,
  Glasses,
  Hammer,
  Shirt,
  Brush,
  Home,
  Shapes,
  Layers,
  Sparkles,
  Package,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  product_count: number;
}

// Map category names to icons
const categoryIcons: Record<string, React.ReactNode> = {
  Pottery: <Palette className="h-10 w-10" />,
  Ceramics: <Palette className="h-10 w-10" />,
  Textiles: <Shirt className="h-10 w-10" />,
  Jewelry: <Gem className="h-10 w-10" />,
  Woodworking: <Trees className="h-10 w-10" />,
  Glass: <Glasses className="h-10 w-10" />,
  Metalwork: <Hammer className="h-10 w-10" />,
  Leather: <Layers className="h-10 w-10" />,
  Painting: <Brush className="h-10 w-10" />,
  Sculpture: <Shapes className="h-10 w-10" />,
  "Home Decor": <Home className="h-10 w-10" />,
  "Mixed Media": <Sparkles className="h-10 w-10" />,
};

// Map category names to gradient colors
const categoryColors: Record<string, string> = {
  Pottery: "from-amber-500 to-orange-600",
  Ceramics: "from-orange-400 to-red-500",
  Textiles: "from-pink-500 to-rose-600",
  Jewelry: "from-purple-500 to-indigo-600",
  Woodworking: "from-amber-600 to-yellow-700",
  Glass: "from-cyan-400 to-blue-500",
  Metalwork: "from-slate-500 to-zinc-600",
  Leather: "from-amber-700 to-orange-800",
  Painting: "from-violet-500 to-purple-600",
  Sculpture: "from-emerald-500 to-teal-600",
  "Home Decor": "from-rose-400 to-pink-500",
  "Mixed Media": "from-fuchsia-500 to-pink-600",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories?includeCount=true")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);

  const getIcon = (name: string) => {
    return categoryIcons[name] || <Package className="h-10 w-10" />;
  };

  const getGradient = (name: string) => {
    return categoryColors[name] || "from-gray-500 to-slate-600";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Browse Categories
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our handcrafted collections organized by craft type. Each
              category features unique items made by talented artisans.
            </p>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-xl aspect-[4/3]"></div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="group block"
                >
                  <div
                    className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${getGradient(
                      category.name
                    )} aspect-[4/3] p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                  >
                    {/* Icon */}
                    <div className="text-white/90 mb-4 transition-transform duration-300 group-hover:scale-110">
                      {getIcon(category.name)}
                    </div>

                    {/* Category Name */}
                    <h2 className="text-xl font-bold text-white mb-1">
                      {category.name}
                    </h2>

                    {/* Product Count */}
                    <p className="text-white/80 text-sm">
                      {category.product_count}{" "}
                      {category.product_count === 1 ? "product" : "products"}
                    </p>

                    {/* Decorative circle */}
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full transition-transform duration-300 group-hover:scale-150" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                No categories found
              </p>
            </div>
          )}

          {/* Browse All Products Link */}
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
