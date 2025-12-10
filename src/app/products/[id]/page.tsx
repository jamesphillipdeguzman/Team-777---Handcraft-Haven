"use client";

import { useState, useEffect, use } from "react";
// import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Check } from "lucide-react";
import { RelatedProducts } from "@/components/RelatedProducts";
import { ProductReviews } from "@/components/ProductReviews";
import { useWishlist } from "@/context/wishlistContext";
import ProductImageCarousel from "@/components/ProductImageCarousel";

interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
  artisan_id: number | null;
  artisan_name: string | null;
  artisan_bio: string | null;
  artisan_profile_image: string | null;
  images: ProductImage[];
  categories: Category[];
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const { addToWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Product not found");
          throw new Error("Failed to load product");
        }
        return res.json();
      })
      .then((data) => {
        setProduct(data.product);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return <SkeletonPage />;
  }

  if (error || !product) {
    return <ErrorPage error={error} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image Carousel */}
            <div>
              {product.images && product.images.length > 0 ? (
                <ProductImageCarousel images={product.images} layout="page" /> // pass full array
              ) : (
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Categories */}
              {product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.id}`}
                      className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              {/* Artisan */}
              {product.artisan_name && (
                <p className="text-muted-foreground mb-4">
                  by{" "}
                  <span className="text-foreground font-medium">
                    {product.artisan_name}
                  </span>
                </p>
              )}

              {/* Price */}
              <p className="text-3xl font-bold text-accent mb-6">
                ${Number(product.price).toFixed(2)}
              </p>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      price: product.price,
                      image_url: product.images?.[0]?.image_url,
                      artisan_name: product.artisan_name || undefined,
                    });
                    setAddedToCart(true);
                    setTimeout(() => setAddedToCart(false), 2000);
                  }}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    addToWishlist({
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      price: product.price,
                      image_url: product.images?.[0]?.image_url ?? undefined,
                      artisan_name: product.artisan_name ?? undefined,
                    })
                  }
                >
                  Add to Wishlist
                </Button>
              </div>

              {/* Artisan Info */}
              {product.artisan_name && product.artisan_bio && (
                <div className="border-t border-border pt-6">
                  <h2 className="text-lg font-semibold mb-3">
                    About the Artisan
                  </h2>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium mb-2">{product.artisan_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.artisan_bio}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews */}
          <ProductReviews productId={product.id} />

          {/* Related Products */}
          <RelatedProducts productId={product.id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Optional: skeleton loading page component
function SkeletonPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="animate-pulse aspect-square bg-muted rounded-lg"></div>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-10 bg-muted rounded w-1/4"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Optional: error page component
function ErrorPage({ error }: { error?: string | null }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">{error || "Product not found"}</h1>
            <p className="text-muted-foreground mb-4">
              The product you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
