import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { usePatient } from "@/context/PatientContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star, Building2 } from "lucide-react";

const PatientWriteReview = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { visitHistory, markReviewed } = usePatient();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const visit = visitHistory.find((v) => v.id === visitId);

  useEffect(() => {
    if (!visit) {
      navigate("/patient/reviews");
    }
  }, [visit, navigate]);

  const handleSubmitReview = () => {
    if (visitId && reviewText.trim()) {
      markReviewed(visitId, reviewText.trim(), rating);
      navigate("/patient/reviews");
    }
  };

  if (!visit) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link
            to="/patient/reviews"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <span className="font-semibold text-foreground">Write Review</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Clinic Info */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-6 w-6 text-[#00555A]" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">{visit.clinicName}</h1>
              <p className="text-sm text-muted-foreground">{visit.date}</p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">Share your experience</h2>
          
          <div className="space-y-6">
            {/* Rating */}
            <div className="space-y-3">
              <Label>Rating (1–5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="rounded-lg p-2 transition-colors hover:bg-amber-100"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        n <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {rating === 5 && "Excellent"}
                {rating === 4 && "Very Good"}
                {rating === 3 && "Good"}
                {rating === 2 && "Fair"}
                {rating === 1 && "Poor"}
              </p>
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <Label htmlFor="review-text">Your review (optional)</Label>
              <textarea
                id="review-text"
                className="min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00555A] resize-none"
                placeholder="How was your experience? Share details about the service, staff, cleanliness, wait time, etc."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {reviewText.length} characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate("/patient/reviews")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={!reviewText.trim()}
                className="flex-1"
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientWriteReview;
