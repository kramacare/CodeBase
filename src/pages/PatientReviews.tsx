import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";

interface Visit {
  clinic_id: string;
  clinic_name: string;
  date: string;
  time: string;
  has_reviewed: boolean;
}

const PatientReviews = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          
          const response = await fetch(`http://localhost:8000/auth/patient/completed-appointments?patient_id=${user.patient_id || user.id}`);
          if (response.ok) {
            const data = await response.json();
            setVisits(data.visits || []);
          }
        }
      } catch (error) {
        console.error("Error fetching visits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, []);

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

        {loading ? (
          <div className="mt-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : visits.length === 0 ? (
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
            {visits.map((v) => (
              <li
                key={v.clinic_id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-foreground">{v.clinic_name}</p>
                  <p className="text-sm text-muted-foreground">{v.date} at {v.time}</p>
                </div>
                {!v.has_reviewed ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/patient/reviews/${v.clinic_id}`, { state: { visit: v } })}
                  >
                    Write review
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
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
