"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface Review {
  id: number;
  name: string;
  comment: string;
  star_rating: number;
  created_at: string;
  user_id: number | null;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
}

interface ProductReviewsProps {
  productId: number;
}

function StarRating({
  rating,
  onRate,
  interactive = false,
  size = "md",
}: {
  rating: number;
  onRate?: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-gray-300"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ totalReviews: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [starRating, setStarRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || { totalReviews: 0, averageRating: 0 });
    } catch {
      console.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || !comment.trim() || starRating === 0) {
      setError("Please fill in all fields and select a rating.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          comment: comment.trim(),
          star_rating: starRating,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      const data = await res.json();
      setReviews([data.review, ...reviews]);
      setStats({
        totalReviews: stats.totalReviews + 1,
        averageRating:
          (stats.averageRating * stats.totalReviews + starRating) /
          (stats.totalReviews + 1),
      });

      // Reset form
      setName("");
      setComment("");
      setStarRating(0);
      setShowForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-border pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          {stats.totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={Math.round(stats.averageRating)} size="sm" />
              <span className="text-lg font-semibold">{stats.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
          Your review has been submitted successfully!
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="review-name" className="block text-sm font-medium mb-1">
                Your Name
              </label>
              <input
                id="review-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <StarRating
                rating={starRating}
                onRate={setStarRating}
                interactive
                size="lg"
              />
            </div>

            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium mb-1">
                Your Review
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="Share your experience with this product..."
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-border pb-6 last:border-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{review.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.star_rating} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-muted-foreground whitespace-pre-line">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
