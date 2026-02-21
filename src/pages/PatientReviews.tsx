import { Link, useNavigate } from "react-router-dom";
import { usePatient } from "@/context/PatientContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";

const PatientReviews = () => {
  const { visitHistory } = usePatient();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link
            to="/patient"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <span className="font-semibold text-foreground">Write review</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">Clinics you visited</h1>
        <p className="mt-1 text-muted-foreground">
          Leave a review for clinics you&apos;ve been to.
        </p>

        {visitHistory.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">No visits yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Book and complete an appointment to see clinics here and write a
              review.
            </p>
            <Button asChild className="mt-4">
              <Link to="/patient/find-clinics">Book appointment</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {visitHistory.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-foreground">{v.clinicName}</p>
                  <p className="text-sm text-muted-foreground">{v.date}</p>
                  {v.hasReviewed && v.rating != null && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-amber-600">
                      <Star className="h-4 w-4 fill-current" />
                      {v.rating}/5
                      {v.review && (
                        <span className="text-muted-foreground">
                          — {v.review}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                {!v.hasReviewed ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/patient/reviews/${v.id}`)}
                  >
                    Write review
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Reviewed
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default PatientReviews;
