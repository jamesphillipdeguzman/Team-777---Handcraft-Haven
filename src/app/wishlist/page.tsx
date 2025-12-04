"use client";

import { useWishlist } from "@/context/wishlistContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Image from "next/image";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  return (
    <div className="container mx-auto px-4 py-8">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 mt-10">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <p className="text-gray-600 mb-30">No product added yet.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-30">
          {wishlist.map((p) => (
            <li key={p.id} className="border rounded p-4 shadow">
              <Image
                src={p.image_url ?? "/placeholder.png"}
                alt={p.name ?? "Product Image"}
                className="w-full h-100 object-cover mb-4"
                width={500}
                height={500}
              />
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-gray-500">{p.category}</p>
              <p className="text-green-600 font-bold">R$ {p.price}</p>
              <p className="text-sm text-gray-700 mt-2">{p.description}</p>
              <button

                onClick={() => removeFromWishlist(p.id)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"

              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>

              </button>
            </li>
          ))}
        </ul>
      )}
      <Footer />
    </div>
  );
}