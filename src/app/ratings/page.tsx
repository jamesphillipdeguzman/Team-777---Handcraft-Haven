'use client'


import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState } from "react";

{/* These are used to make it easier to access information like commenter id and name */ }
type Review = {
    id: number;
    name: string;
    comment: string;
    rating: number;
};

{/* Momentary database example */ }
const initialReviews: Review[] = [
    { id: 1, name: "Alice", comment: "Great service!", rating: 4 },
    { id: 2, name: "Bob", comment: "Loved the experience.", rating: 5 },
    { id: 3, name: "Charlie", comment: "Could be better.", rating: 3 },
];

{/* This function is for the star rating functionality */ }
function StarRating({
    rating,
    onRate,
    readOnly = false,
}: {
    rating: number;
    onRate?: (rating: number) => void;
    readOnly?: boolean;
}) {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    onClick={() => {
                        if (!readOnly && onRate) onRate(star);
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 cursor-${readOnly ? "default" : "pointer"} ${star <= rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.946a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.946c.3.921-.755 1.688-1.538 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.783.57-1.838-.197-1.538-1.118l1.287-3.946a1 1 0 00-.364-1.118L2.025 9.373c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.946z" />
                </svg>
            ))}
        </div>
    );
}

function ReviewBox({ review, editable = false }: { review: Review; editable?: boolean }) {
    const [rating, setRating] = useState<number>(review.rating);

    return (
        <div className="border p-4 rounded-lg shadow-md mb-4">
            <h3 className="font-semibold text-lg">{review.name}</h3>
            <p className="text-gray-700 my-2">{review.comment}</p>
            <StarRating rating={rating} onRate={setRating} readOnly={!editable} />
        </div>
    );
}

export default function RatingPage() {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);

    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);

    const handleSubmit = () => {
        if (!name || !comment || rating === 0) {
            alert("Please fill in all fields and select a rating before submitting!");
            return;
        }
        const newReview: Review = {
            id: reviews.length + 1,
            name,
            comment,
            rating,
        };
        setReviews([newReview, ...reviews]);
        setName("");
        setComment("");
        setRating(0);
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold">Ratings</h1>
                    <p className="mt-4 text-gray-600">This is just an example page, some things may not be functioning yet and there is momentarily no database to store products and comments in!</p>

                    {/* This is the User form Review */}
                    <div className="mt-8 p-4 border rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Leave Your Review</h2>
                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-md p-2 mb-2"
                        />
                        <textarea
                            placeholder="Your comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full border rounded-md p-2 mb-2"
                        />
                        <div className="mb-2">
                            <StarRating rating={rating} onRate={setRating} readOnly={false} />
                        </div>
                        <button
                            onClick={handleSubmit}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            Submit Review
                        </button>
                    </div>

                    {/* These are existing reviews shown on the page */}
                    <div>
                        {reviews.map((review) => (
                            <ReviewBox key={review.id} review={review} editable={false} />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}