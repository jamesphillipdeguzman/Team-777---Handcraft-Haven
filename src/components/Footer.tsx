import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Handcraft Haven</h3>
            <p className="text-sm text-muted-foreground">
              Your destination for unique handcrafted products and artisanal
              goods.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          {/* Shop Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  All Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Account</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/account"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Order History
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Help</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Customer Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 Handcraft Haven. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
