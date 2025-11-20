import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import client from "@/lib/db";
import ClientSideRating from "./ClientSideRating";

export default async function RatingPage() {
    const result = await client.query(
        "SELECT id, name, comment, star_rating FROM ratings ORDER BY id DESC"
    );

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <ClientSideRating ratings={result.rows} />
            </main>
            <Footer />
        </div>
    );
}