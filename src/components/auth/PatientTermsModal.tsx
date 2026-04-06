import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PatientTermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

const PatientTermsModal = ({ open, onOpenChange, onAccept }: PatientTermsModalProps) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Appointment Policy
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Important Notice Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Important Notice</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If the clinic is closed on your selected date, your appointment will be automatically moved to the next working day
            </p>
          </div>

          {/* Priority Handling Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Priority Handling</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your booking will be given priority on the rescheduled day
            </p>
          </div>

          {/* Consent Line */}
          <div className="pt-4 border-t">
            <div className="flex items-start gap-3">
              <Checkbox
                id="patient-terms-accepted"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
              />
              <label 
                htmlFor="patient-terms-accepted" 
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                By continuing, you agree to this scheduling policy.
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
            I understand and agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientTermsModal;
