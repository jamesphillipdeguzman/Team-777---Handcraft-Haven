"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
<<<<<<< HEAD
import { Search, ShoppingCart, Heart, User, Menu, LogIn } from "lucide-react";
=======
import { Search, ShoppingCart, Heart, User, Menu } from "lucide-react";
>>>>>>> f3a5e6f187b32f27082d1a7a7c747545bb7f8231

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
<<<<<<< HEAD
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
=======
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
>>>>>>> f3a5e6f187b32f27082d1a7a7c747545bb7f8231
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">Handcraft Haven</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/categories"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Categories
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Products
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex flex-1 max-w-md mx-8"
        >
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
            <Button variant="ghost" size="icon" asChild>
<<<<<<< HEAD
              <Link href="/login">
                <LogIn className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
=======
>>>>>>> f3a5e6f187b32f27082d1a7a7c747545bb7f8231
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/account">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Link>
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
              <nav className="flex flex-col gap-4 mt-8">
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
                <Link
                  href="/categories"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Categories
                </Link>
                <Link
                  href="/products"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Products
                </Link>
                <Link
<<<<<<< HEAD
                  href="/login"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Login
                </Link>
                <Link
=======
>>>>>>> f3a5e6f187b32f27082d1a7a7c747545bb7f8231
                  href="/wishlist"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Wishlist
                </Link>
                <Link
                  href="/cart"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Cart
                </Link>
                <Link
                  href="/account"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Account
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
