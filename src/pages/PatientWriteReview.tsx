import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star, Building2 } from "lucide-react";

interface VisitState {
  clinic_id: string;
  clinic_name: string;
  date: string;
  time: string;
}

const PatientWriteReview = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const visit = location.state?.visit as VisitState | undefined;

  useEffect(() => {
    if (!visit || !clinicId) {
      navigate("/patient/reviews");
    }
  }, [visit, clinicId, navigate]);

  const handleSubmitReview = async () => {
    if (!clinicId || !visit) return;

    setLoading(true);
    setError("");

    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);

        const response = await fetch("http://localhost:8000/auth/reviews/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinic_id: clinicId,
            patient_id: user.patient_id || user.id || "P-GUEST",
            patient_name: user.name || user.email?.split('@')[0] || "Patient",
            rating: rating,
            review_text: reviewText.trim()
          })
        });

        if (response.ok) {
          setSuccess(true);
          setTimeout(() => {
            navigate("/patient/reviews");
          }, 1500);
        } else {
          const data = await response.json();
          setError(data.detail || "Failed to submit review");
        }
      }
    } catch (err) {
      setError("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (!visit) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Star className="h-10 w-10 text-green-600 fill-current" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Review Submitted!</h2>
          <p className="mt-2 text-muted-foreground">Thank you for your feedback.</p>
          <p className="mt-1 text-sm text-muted-foreground">Redirecting to reviews...</p>
        </div>
      </div>
    );
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
              <h1 className="text-xl font-semibold text-foreground">{visit.clinic_name}</h1>
              <p className="text-sm text-muted-foreground">{visit.date} at {visit.time}</p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">Share your experience</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

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
                disabled={loading}
                className="flex-1 bg-[#00555A] hover:bg-[#004455]"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientWriteReview;
