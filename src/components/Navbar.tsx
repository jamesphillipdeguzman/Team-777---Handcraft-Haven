"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Heart, User, LogIn, Menu } from "lucide-react";
import { useWishlist } from "@/context/wishlistContext";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const [user, setUser] = useState<{ loggedIn: boolean; username?: string }>({ loggedIn: false });
  const [hasMounted, setHasMounted] = useState(false);
  const { wishlist } = useWishlist();
  const { getCartCount } = useCart();

  const cartCount = hasMounted ? getCartCount() : 0;
  const wishlistCount = hasMounted ? wishlist.length : 0;

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const id = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        const username = data.user?.email?.split("@")[0];
        setUser({ loggedIn: !!data.loggedIn, username });
      })
      .catch(() => setUser({ loggedIn: false }));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams({ search: searchQuery });
    window.location.href = `/products?${params}`;
  };

  const handleAccountClick = () => {
    if (user.loggedIn) {
      window.location.href = "/account";
    } else {
      window.location.href = "/login";
    }
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
            <Link href="/artisans" className="text-sm font-medium hover:text-primary transition-colors">
              Artisans
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="/ratings" className="text-sm font-medium hover:text-primary transition-colors">
              Ratings
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
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

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-2">


            {hasMounted &&
              (user.loggedIn ? (
                <Button variant="ghost" className="flex items-center gap-1" onClick={() => (window.location.href = "/dashboard")}>
                  <span>Welcome {user.username}</span>
                </Button>
              ) : (
                <Button variant="ghost" className="flex items-center gap-1" onClick={() => (window.location.href = "/login")}>
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Button>
              ))}


            {/* Account Icon */}
            <Button variant="ghost" size="icon" onClick={handleAccountClick}>
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </div>

          {/* Wishlist */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
              <span className="sr-only">Wishlist</span>
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
              <span className="sr-only">Cart</span>
            </Link>
          </Button>


          {/* Mobile Menu */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
