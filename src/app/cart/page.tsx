import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="mt-4 text-gray-600">
            View and manage items in your shopping cart
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
