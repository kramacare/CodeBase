import { useParams, useNavigate } from "react-router-dom";
import { mockClinics } from "@/data/mockData";
import { ArrowLeft, MapPin, Phone, Star } from "lucide-react";
import DoctorCard from "@/components/shared/DoctorCard";

const ClinicDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const clinic = mockClinics.find((c) => c.id === id);

  if (!clinic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Clinic not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold text-foreground">
            {clinic.name}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Clinic Info */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">
            {clinic.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {clinic.address}
            </span>

            <span className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {clinic.phone}
            </span>

            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {clinic.rating} ({clinic.reviewCount})
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {clinic.specializations.map((s) => (
              <span
                key={s}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Map placeholder */}
          <div className="mt-4 flex h-36 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
            Map placeholder — {clinic.address}
          </div>
        </div>

        {/* Doctors Section */}
        <h2 className="mt-8 text-lg font-semibold text-foreground">
          Available Doctors
        </h2>

        <div className="mt-4 space-y-3">
          {clinic.doctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onBook={() => navigate(`/book/${clinic.id}/${doc.id}`)}

            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default ClinicDetails;
