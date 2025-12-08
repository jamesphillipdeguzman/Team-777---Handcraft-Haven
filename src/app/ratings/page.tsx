import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { sql } from "@/lib/db";

export default async function RatingPage() {
    const rows = await sql`
  SELECT ratings.id, ratings.name, ratings.comment, ratings.star_rating,
         products.id AS product_id, products.name AS product_name
  FROM ratings
  LEFT JOIN products ON ratings.product_id = products.id
  ORDER BY ratings.id DESC
`;


    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">All Ratings</h1>
                {rows.length === 0 && <p>No ratings yet.</p>}
                {rows.map((r: any) => (
                    <div key={r.id} className="border p-4 rounded mb-4 shadow-sm">
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-gray-700">{r.comment}</div>
                        <div className="text-sm text-muted-foreground mb-1">
                            Product: {r.product_name ?? `Unknown Product (${r.product_id})`}
                        </div>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-6 w-6 ${star <= r.star_rating ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.946a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.946c.3.921-.755 1.688-1.538 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.783.57-1.838-.197-1.538-1.118l1.287-3.946a1 1 0 00-.364-1.118L2.025 9.373c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.946z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                ))}
            </main>
            <Footer />
        </div>
    );
}