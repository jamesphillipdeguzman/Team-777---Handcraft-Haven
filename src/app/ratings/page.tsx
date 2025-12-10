import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { sql } from "@/lib/db";

type Review = {
    id: number;
    name: string;
    comment: string;
    star_rating: number;
    product_id?: number;
    product_name?: string;
    created_at?: string;
};

type Product = {
    id: number;
    name: string;
};

export default async function RatingPage() {
    // Fetch all ratings with product info
    const ratings = await sql`
        SELECT r.id, r.name, r.comment, r.star_rating, r.product_id,
               p.name as product_name
        FROM ratings r
        LEFT JOIN products p ON r.product_id = p.id
        ORDER BY r.id DESC
    ` as Review[];

    // Fetch all products for the selector
    const products = await sql`
        SELECT id, name FROM products ORDER BY name ASC
    ` as Product[];

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-gray-50">
                <ClientSideRating ratings={ratings} products={products} />
            </main>
            <Footer />
        </div>
    );
}
