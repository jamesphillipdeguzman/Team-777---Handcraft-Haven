"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, ShoppingCart, Heart, User, Menu, LogIn } from "lucide-react";
import { useWishlist } from "@/context/wishlistContext";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const { wishlist } = useWishlist();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => setLoggedIn(data.loggedIn))
      .catch(() => setLoggedIn(false)); // fallback
  }, []);
  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(); 
    if (searchQuery.trim()) {
      params.set("search", searchQuery);
      window.location.href = `/products${params.toString() ? `?${params}` : ""}`;
    }
  };

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (loggedIn) {
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
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">Categories</Link>
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">Products</Link>
            <Link href="/ratings" className="text-sm font-medium hover:text-primary transition-colors">Ratings</Link>
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
            {loggedIn === false && (
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
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlist.length > 99 ? "99+" : wishlist.length}
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

            {/* Account */}
            <Button variant="ghost" size="icon" onClick={handleAccountClick}>
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8 m-5">
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
                <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">Categories</Link>
                <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">Products</Link>
                {loggedIn === false && (
                  <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
                )}

                {/* Wishlist with count */}
                <Link href="/wishlist" className="relative text-sm font-medium hover:text-primary transition-colors">
                  Wishlist
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlist.length > 99 ? "99+" : wishlist.length}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link href="/cart" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors relative">
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
