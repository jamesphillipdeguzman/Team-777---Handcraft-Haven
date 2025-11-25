import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { sql } from "@/lib/db";
import ClientSideRating from "./ClientSideRating";

export default async function RatingPage() {

    type Review = {
        id: number;
        name: string;
        comment: string;
        star_rating: number;
    };


    const rows = await sql`SELECT id, name, comment, star_rating FROM ratings ORDER BY id DESC` as Review[];

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <ClientSideRating ratings={rows} />
            </main>
            <Footer />
        </div>
    );
}