import { MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Clinic } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

interface ClinicCardProps {
  clinic: Clinic;
}

const ClinicCard = ({ clinic }: ClinicCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-foreground">
            {clinic.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{clinic.address}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {clinic.specializations.map((s) => (
              <span
                key={s}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">
              {clinic.rating}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {clinic.reviewCount} reviews
          </span>
          <span className="mt-1 text-xs font-medium text-accent">
            {clinic.distance}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {clinic.doctors.length} doctor{clinic.doctors.length > 1 ? "s" : ""} available
        </p>
        <Button
          size="sm"
          onClick={() => navigate(`/clinic-details/${clinic.id}`)}
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
};

export default ClinicCard;
