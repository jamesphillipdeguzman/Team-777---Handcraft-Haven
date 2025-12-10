"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Check } from "lucide-react";
import { RelatedProducts } from "@/components/RelatedProducts";
import { ProductReviews } from "@/components/ProductReviews";
import { useWishlist } from "@/context/wishlistContext";

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


  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Product not found");
          }
          throw new Error("Failed to load product");
        }
        return res.json();
      })
      .then((data) => {
        setProduct(data.product);
        if (data.product.images && data.product.images.length > 0) {
          setSelectedImage(data.product.images[0].image_url);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image skeleton */}
              <div className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg"></div>
                <div className="flex gap-2 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
              {/* Info skeleton */}
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

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h1 className="text-2xl font-bold mb-2">
                {error || "Product not found"}
              </h1>
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
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-4">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
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
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.image_url)}
                      className={`relative w-20 h-20 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${selectedImage === img.image_url
                        ? "border-accent"
                        : "border-transparent hover:border-muted-foreground"
                        }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={`${product.name} thumbnail`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button

                  variant="outline"
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
                  size="lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  Add to Wishlist
                </Button>
              </div>

              {/* Artisan Info */}
              {product.artisan_name && product.artisan_bio && (
                <div className="border-t border-border pt-6">
                  <h2 className="text-lg font-semibold mb-3">About the Artisan</h2>
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
