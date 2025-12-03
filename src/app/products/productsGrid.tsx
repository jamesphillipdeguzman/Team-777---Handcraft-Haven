"use client";

import { useWishlist } from "@/context/wishlistContext";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url?: string;
  category?: string;
};

export default function ProductsGrid({ products }: { products: Product[] }) {
  const { addToWishlist } = useWishlist();

  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((p) => {
        const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
        return (
          <li key={p.id} className="relative border rounded overflow-hidden shadow group p-4">
            <Image
              src={p.image_url || placeholderImage}
              alt={p.name}
              className="w-full h-100 object-cover mb-4"
              width={500}
              height={500}
            />
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-gray-500">{p.category}</p>
            <p className="text-green-600 font-bold">R$ {p.price}</p>
            <p className="text-sm text-gray-700 mt-2">{p.description}</p>
            <button
              onClick={() => {
                addToWishlist(p)
                alert("Product added to wishlist!");

              }}

              className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-red-100 transition text-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>

            </button>
          </li>
        );
      })}
    </ul>
  );
}