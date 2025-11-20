"use client";

import { useState } from "react";

type Review = {
    id: number;
    name: string;
    comment: string;
    star_rating: number;
};

type Props = {
    ratings: Review[];
};

export default function ClientSideRating({ ratings }: Props) {
    const [localRatings, setLocalRatings] = useState<Review[]>(ratings);
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [star_rating, setStarRating] = useState(0);

    // This is the star rating
    const StarRating = ({
        star_rating,
        onRate,
        readOnly = false,
    }: {
        star_rating: number;
        onRate?: (star_rating: number) => void;
        readOnly?: boolean;
    }) => (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    onClick={() => {
                        if (!readOnly && onRate) onRate(star);
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 ${star <= star_rating ? "text-yellow-400" : "text-gray-300"
                        } ${!readOnly ? "cursor-pointer" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.946a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.946c.3.921-.755 1.688-1.538 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.783.57-1.838-.197-1.538-1.118l1.287-3.946a1 1 0 00-.364-1.118L2.025 9.373c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.946z" />
                </svg>
            ))}
        </div>
    );

    const handleSubmit = async () => {
        if (!name || !comment || star_rating === 0) {
            alert("Please fill in all fields and select a rating.");
            return;
        }

        try {
            const res = await fetch("/api/ratings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, comment, star_rating }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.error || "Failed to submit rating.");
                return;
            }

            const newReview: Review = await res.json();

            setLocalRatings([newReview, ...localRatings]);

            // This resets the form when a new comment is created
            setName("");
            setComment("");
            setStarRating(0);
        } catch (err) {
            console.error("Error submitting rating:", err);
            alert("An unexpected error occurred.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold">Ratings</h1>

            {/* This is the form the user uses to make a new comments */}
            <div className="mt-8 p-4 border rounded-lg shadow-md mb-8">
                <input
                    className="w-full border p-2 mb-2 rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                />
                <textarea
                    className="w-full border p-2 mb-2 rounded"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Your comment"
                />
                <div className="mb-2">
                    <StarRating star_rating={star_rating} onRate={setStarRating} readOnly={false} />
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                    Submit Review
                </button>
            </div>

            {/* This is the reviews that are displayed on the page from the database */}
            <div>
                {localRatings.map((r, index) => (
                    <div
                        key={r.id ?? index} // unique key fallback
                        className="border p-4 rounded mb-4 shadow-sm"
                    >
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-gray-700">{r.comment}</div>
                        <StarRating star_rating={r.star_rating} readOnly={true} />
                    </div>
                ))}
            </div>
        </div>
    );
}