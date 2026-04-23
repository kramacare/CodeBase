import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationAccessCardProps {
  onUseGPS: () => void;
  loading?: boolean;
}

const LocationAccessCard = ({ onUseGPS, loading }: LocationAccessCardProps) => (
  <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
      <Navigation className="h-7 w-7 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground">
      Allow location access to find nearby clinics
    </h3>
    <p className="mt-2 text-sm text-muted-foreground">
      We use your location to show clinics closest to you.
    </p>
    <div className="mt-6">
      <Button onClick={onUseGPS} disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Getting your location…
          </>
        ) : (
          <>
            <MapPin className="mr-1 h-4 w-4" />
            Use Current Location
          </>
        )}
      </Button>
    </div>
  </div>
);

export default LocationAccessCard;
