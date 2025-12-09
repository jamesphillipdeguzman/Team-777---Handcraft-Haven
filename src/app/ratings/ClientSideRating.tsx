"use client";

import { useState, useEffect } from "react";

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

type Props = {
    ratings: Review[];
    products: Product[];
};

export default function ClientSideRating({ ratings, products }: Props) {
    const [localRatings, setLocalRatings] = useState<Review[]>(ratings);
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [star_rating, setStarRating] = useState(0);
    const [selectedProductId, setSelectedProductId] = useState<number | "">("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Check authentication status
    useEffect(() => {
        fetch("/api/auth/status")
            .then((res) => res.json())
            .then((data) => setIsLoggedIn(data.authenticated))
            .catch(() => setIsLoggedIn(false));
    }, []);

    // Star rating component
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
                        } ${!readOnly ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.946a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.946c.3.921-.755 1.688-1.538 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.783.57-1.838-.197-1.538-1.118l1.287-3.946a1 1 0 00-.364-1.118L2.025 9.373c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.946z" />
                </svg>
            ))}
        </div>
    );

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        if (!name || !comment || star_rating === 0 || !selectedProductId) {
            setError("Please fill in all fields, select a product, and choose a rating.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/ratings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    comment,
                    star_rating,
                    product_id: selectedProductId,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || "Failed to submit rating.");
                setIsSubmitting(false);
                return;
            }

            const newReview: Review = await res.json();

            // Find product name for display
            const product = products.find(p => p.id === selectedProductId);
            newReview.product_name = product?.name;

            setLocalRatings([newReview, ...localRatings]);

            // Reset form
            setName("");
            setComment("");
            setStarRating(0);
            setSelectedProductId("");
            setSuccess("Your review has been submitted successfully!");
        } catch (err) {
            console.error("Error submitting rating:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold">Product Reviews</h1>
            <p className="mt-2 text-gray-600">
                Share your experience with products from our artisan marketplace.
            </p>

            {/* Review submission form */}
            <div className="mt-8 p-6 border rounded-lg shadow-md mb-8 bg-white">
                <h2 className="text-xl font-semibold mb-4">Write a Review</h2>

                {!isLoggedIn && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                        You are submitting as a guest. <a href="/login" className="underline font-medium">Log in</a> to track your reviews and prevent duplicates.
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                        {success}
                    </div>
                )}

                {/* Product selector */}
                <div className="mb-4">
                    <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Product *
                    </label>
                    <select
                        id="product"
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : "")}
                    >
                        <option value="">Choose a product to review...</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name *
                    </label>
                    <input
                        id="name"
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        maxLength={255}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Review *
                    </label>
                    <textarea
                        id="comment"
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        maxLength={2000}
                    />
                    <p className="text-xs text-gray-500 mt-1">{comment.length}/2000 characters</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating *
                    </label>
                    <StarRating star_rating={star_rating} onRate={setStarRating} readOnly={false} />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
            </div>

            {/* Reviews list */}
            <div>
                <h2 className="text-xl font-semibold mb-4">
                    All Reviews ({localRatings.length})
                </h2>

                {localRatings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to write one!</p>
                ) : (
                    localRatings.map((r, index) => (
                        <div
                            key={r.id ?? index}
                            className="border p-4 rounded-lg mb-4 shadow-sm bg-white hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-semibold">{r.name}</span>
                                    {r.product_name && (
                                        <span className="text-gray-500 text-sm ml-2">
                                            on <span className="font-medium">{r.product_name}</span>
                                        </span>
                                    )}
                                </div>
                                {r.created_at && (
                                    <span className="text-gray-400 text-sm">{formatDate(r.created_at)}</span>
                                )}
                            </div>
                            <StarRating star_rating={r.star_rating} readOnly={true} />
                            <p className="text-gray-700 mt-2">{r.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
