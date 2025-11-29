import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getProducts} from "@/lib/products";  

export default async function ProductsPage() {
  const products = await getProducts();
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
         <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {products.map((p: any) => (
    <li key={p.id} className="border rounded p-4 shadow">
      <img src={p.image_url} alt={p.name} className="w-full h-100 object-cover mb-4" height={500} width={500}/>
      <h2 className="text-xl font-semibold">{p.name}</h2>
      <p className="text-gray-500">{p.category}</p>
      <p className="text-green-600 font-bold">R$ {p.price}</p>
      <p className="text-sm text-gray-700 mt-2">{p.description}</p>
    </li>
  ))}
</ul>

        </div>
      </main>
      <Footer />
    </div>
  );
}
