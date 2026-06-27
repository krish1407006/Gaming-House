import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { FaStar, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import StarRating from "./StarRating";
import NumberRating from "./NumberRating";
import apiService from "../services/api";

export default function ReviewSection({ gameId, onReviewUpdate }) {
  const { isSignedIn, getToken } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    review: "",
    isPublic: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Set up auth token for API service
  useEffect(() => {
    if (getToken) {
      window.__clerk_token_getter = getToken;
    }
  }, [getToken]);

  const loadMovieData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Only try to load from backend if gameId looks like a valid MongoDB ObjectId
      if (!gameId || gameId.length < 20) {
        setError("Invalid gaming ID");
        return;
      }

      // Load game details including user rating
      const movieData = await apiService.getGameById(gameId);

      if (movieData.userRating) {
        setUserRating(movieData.userRating);
        setReviewForm({
          rating: movieData.userRating.rating,
          review: movieData.userRating.review || "",
          isPublic:
            movieData.userRating.isPublic !== undefined
              ? movieData.userRating.isPublic
              : true,
        });
      } else {
        setUserRating(null);
        setReviewForm({
          rating: 0,
          review: "",
          isPublic: true,
        });
      }

      // Load game reviews
      const ratingsData = await apiService.getGameRatings(gameId, {
        limit: 10,
        sortBy: "helpfulVotes",
        sortOrder: "desc",
      });

      setReviews(ratingsData.ratings || []);
    } catch (err) {
      console.error("Failed to load game data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Load user rating and movie reviews
  useEffect(() => {
    loadGameData();
  }, [loadGameData, isSignedIn]);

  const handleRatingChange = (newRating) => {
    setReviewForm((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isSignedIn) {
      setError("You must be signed in to rate gaming");
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 10) {
      setError("Please select a rating between 1 and 10");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await apiService.createOrUpdateRating(gameId, {
        rating: reviewForm.rating,
        review: reviewForm.review.trim(),
        isPublic: reviewForm.isPublic,
      });

      setUserRating(result.data);
      setShowReviewForm(false);
      setEditingReview(null);

      // Reload reviews to show updated data
      await loadMovieData();

      // Notify parent component about the update
      if (onReviewUpdate) {
        onReviewUpdate(result.data);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm("Are you sure you want to delete your review?")) {
      return;
    }

    setSubmitting(true);
    try {
      await apiService.deleteRating(gameId);
      setUserRating(null);
      setReviewForm({ rating: 0, review: "", isPublic: true });
      setShowReviewForm(false);
      await loadMovieData();

      if (onReviewUpdate) {
        onReviewUpdate(null);
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulClick = async (ratingId, isCurrentlyHelpful) => {
    if (!isSignedIn) return;

    try {
      if (isCurrentlyHelpful) {
        await apiService.removeHelpfulMark(ratingId);
      } else {
        await apiService.markReviewHelpful(ratingId);
      }

      // Reload reviews to show updated helpful counts
      await loadMovieData();
    } catch (err) {
      console.error("Failed to update helpful status:", err);
    }
  };

  const startEditing = () => {
    setEditingReview(true);
    setShowReviewForm(true);
  };

  const cancelEditing = () => {
    setEditingReview(false);
    setShowReviewForm(false);
    if (userRating) {
      setReviewForm({
        rating: userRating.rating,
        review: userRating.review || "",
        isPublic: userRating.isPublic,
      });
    } else {
      setReviewForm({ rating: 0, review: "", isPublic: true });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 theme-border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="theme-error-bg border theme-error-border theme-error-text px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* User Rating Section */}
      <div className="theme-bg-secondary rounded-xl p-4 lg:p-6">
        <h3 className="text-lg lg:text-xl font-bold theme-accent mb-3 lg:mb-4">Your Review</h3>

        {isSignedIn ? (
          <div>
            {userRating && !showReviewForm ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <StarRating rating={userRating.rating} size="large" />
                    <span className="text-2xl font-bold theme-accent">
                      {userRating.rating}/10
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={startEditing}
                      className="text-blue-400 hover:text-blue-300 p-2 rounded"
                      title="Edit Review"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      style={{ color: 'var(--accent-color)' }} className="p-2 rounded hover:opacity-80"
                      title="Delete Review"
                      disabled={submitting}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {userRating.review && (
                  <div className="theme-bg-tertiary rounded-lg p-4">
                    <p className="theme-text-primary leading-relaxed">
                      {userRating.review}
                    </p>
                  </div>
                )}

                <div className="text-sm theme-text-secondary">
                  {userRating.isPublic
                    ? "🌐 Public review"
                    : "🔒 Private review"}
                </div>
              </div>
            ) : (
              <div>
                {!showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="theme-button-primary px-6 py-3 rounded-lg font-semibold hover:theme-button-primary-hover transition-colors"
                  >
                    {userRating ? "Edit Your Review" : "Write a Review"}
                  </button>
                )}

                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <NumberRating
                        rating={reviewForm.rating}
                        onRatingChange={handleRatingChange}
                        interactive={true}
                        showLabel={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text-primary mb-2">
                        Review (Optional)
                      </label>
                      <textarea
                        value={reviewForm.review}
                        onChange={(e) =>
                          setReviewForm((prev) => ({
                            ...prev,
                            review: e.target.value,
                          }))
                        }
                        placeholder="Share your thoughts about this gaming..."
                        rows={4}
                        maxLength={1000}
                        className="w-full theme-input rounded-lg px-4 py-3 border theme-border focus:theme-border-accent focus:outline-none resize-vertical"
                      />
                      <div className="text-right text-sm theme-text-secondary mt-1">
                        {reviewForm.review.length}/1000 characters
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={reviewForm.isPublic}
                        onChange={(e) =>
                          setReviewForm((prev) => ({
                            ...prev,
                            isPublic: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <label
                        htmlFor="isPublic"
                        className="text-sm theme-text-primary"
                      >
                        Make this review public
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitting || reviewForm.rating === 0}
                        className="theme-button-primary px-6 py-2 rounded-lg font-semibold hover:theme-button-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <FaSave />
                        {submitting
                          ? "Saving..."
                          : editingReview
                          ? "Update Review"
                          : "Submit Review"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="theme-button-secondary px-6 py-2 rounded-lg font-semibold hover:theme-button-secondary-hover flex items-center gap-2"
                      >
                        <FaTimes />
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="theme-text-secondary mb-4">
              Sign in to rate and review this gaming
            </p>
          </div>
        )}
      </div>

      {/* Other Reviews Section */}
      <div className="theme-bg-secondary rounded-xl p-4 lg:p-6">
        <h3 className="text-lg lg:text-xl font-bold theme-text-primary mb-3 lg:mb-4">
          Reviews ({reviews.length})
        </h3>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="theme-bg-tertiary rounded-lg p-4 border-l-4 theme-border-accent"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} size="small" />
                    <span className="font-bold theme-accent">
                      {review.rating}/10
                    </span>
                    <span className="theme-text-secondary text-sm">
                      by {review.userId}
                    </span>
                  </div>
                  <div className="theme-text-secondary text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {review.review && (
                  <p className="theme-text-primary leading-relaxed mb-3">
                    {review.review}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      handleHelpfulClick(
                        review._id,
                        review.helpfulBy?.includes("currentUser")
                      )
                    }
                    className="theme-text-secondary hover:theme-accent text-sm flex items-center gap-1"
                    disabled={!isSignedIn}
                  >
                    👍 Helpful ({review.helpfulVotes})
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 theme-text-secondary">
            No reviews yet. Be the first to review this gaming!
          </div>
        )}
      </div>
    </div>
  );
}
