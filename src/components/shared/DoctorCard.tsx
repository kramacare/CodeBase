import { Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Doctor } from "@/data/mockData";

interface DoctorCardProps {
  doctor: Doctor;
  onBook?: (doctor: Doctor) => void;
  selected?: boolean;
}

const DoctorCard = ({ doctor, onBook, selected }: DoctorCardProps) => (
  <div
    className={`rounded-xl border p-4 transition-all ${
      selected
        ? "border-primary bg-primary/5 shadow-md"
        : "border-border bg-card shadow-sm hover:shadow-md"
    }`}
  >
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <User className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-foreground">{doctor.name}</h4>
        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-accent">
          <Clock className="h-3 w-3" />
          {doctor.nextAvailable}
        </p>
      </div>
      {onBook && (
        <Button size="sm" variant={selected ? "default" : "outline"} onClick={() => onBook(doctor)}>
          {selected ? "Selected" : "Select"}
        </Button>
      )}
    </div>
  </div>
);

export default DoctorCard;
