'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, ShoppingCart, Heart, User, Menu, LogIn } from "lucide-react";
import { useWishlist } from "@/context/wishlistContext";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const [user, setUser] = useState<{ loggedIn: boolean; username?: string }>({
    loggedIn: false,
  });
  const [hasMounted, setHasMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { wishlist } = useWishlist();
  const { getCartCount } = useCart();

  const cartCount = hasMounted ? getCartCount() : 0;
  const wishlistCount = hasMounted ? wishlist.length : 0;

  // Fix hydration mismatch issues
  useEffect(() => {
    const id = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // NEW: Load user from /api/auth/me (cookie-based auth)
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();

        if (data?.user) {
          setUser({
            loggedIn: true,
            username: data.user.email?.split("@")[0],
          });
        } else {
          setUser({ loggedIn: false });
        }
      } catch {
        setUser({ loggedIn: false });
      }
    }

    loadUser();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams({ search: searchQuery });
    window.location.href = `/products?${params}`;
  };

  const handleAccountClick = () => {
    window.location.href = user.loggedIn ? "/account" : "/login";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">Handcraft Haven</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/artisans" className="text-sm font-medium hover:text-primary">Artisans</Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary">Categories</Link>
            <Link href="/products" className="text-sm font-medium hover:text-primary">Products</Link>
            <Link href="/ratings" className="text-sm font-medium hover:text-primary">Ratings</Link>
            {user.loggedIn && (
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
            )}
          </nav>
        </div>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Desktop Right Icons */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {/* Login Button */}
            {hasMounted && !user.loggedIn && (
              <Button variant="ghost" className="flex items-center gap-1">
                <Link href="/login" className="flex items-center gap-1">
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              </Button>
            )}

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Account */}
            <Button variant="ghost" size="icon" onClick={handleAccountClick}>
              <User className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right">
              <SheetTitle className="sr-only">Mobile navigation</SheetTitle>

              <nav className="flex flex-col gap-4 mt-8 m-5">

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>

                {/* Links */}
                <Link href="/artisans" className="text-sm font-medium hover:text-primary">Artisans</Link>
                <Link href="/categories" className="text-sm font-medium hover:text-primary">Categories</Link>
                <Link href="/products" className="text-sm font-medium hover:text-primary">Products</Link>
                <Link href="/ratings" className="text-sm font-medium hover:text-primary">Ratings</Link>
                {user.loggedIn && (
                  <Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
                )}
                {!user.loggedIn && (
                  <Link href="/login" className="text-sm font-medium hover:text-primary">Login</Link>
                )}

                <Link href="/wishlist" className="relative text-sm font-medium hover:text-primary">
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>

                <Link href="/cart" className="relative text-sm font-medium hover:text-primary">
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>

                <Button variant="ghost" className="text-left p-0" onClick={handleAccountClick}>
                  Account
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
