import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ClinicTermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

const ClinicTermsModal = ({ open, onOpenChange, onAccept }: ClinicTermsModalProps) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Clinic Registration – Terms & Overview
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Section 1: How It Works */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">How It Works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Manage appointments and walk-in queues digitally</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Support multiple doctors with real-time queue tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Use a simple dashboard to control daily operations</span>
              </li>
            </ul>
          </div>

          {/* Section 2: Pricing */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Pricing</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>10% fee applies only to online bookings via the platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>No charges for walk-ins or manual entries</span>
              </li>
            </ul>
            
            {/* Highlighted line */}
            <div className="bg-primary/10 border-l-4 border-primary px-4 py-2 rounded">
              <p className="text-sm font-medium text-primary">
                You only pay when patients book through the platform.
              </p>
            </div>
          </div>

          {/* Section 3: Key Points */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Key Points</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>No setup or subscription fees</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Full control over appointments and queues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Transparent reporting in your dashboard</span>
              </li>
            </ul>
          </div>

          {/* Consent Line */}
          <div className="pt-4 border-t">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms-accepted"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
              />
              <label 
                htmlFor="terms-accepted" 
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                By continuing, you agree to the Terms & Pricing Policy.
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted}
            className="flex-1"
          >
            Accept & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClinicTermsModal;
