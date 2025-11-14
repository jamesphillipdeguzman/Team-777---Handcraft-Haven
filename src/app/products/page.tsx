import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Products</h1>
          <p className="text-gray-600">
            Browse our collection of handcrafted items.
          </p>
          {/* TODO: Add product grid/list here */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
