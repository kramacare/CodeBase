import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePatient } from "@/context/PatientContext";
import { CheckCircle2, MapPin, CalendarDays, Clock, Hash } from "lucide-react";

interface ConfirmationState {
  clinic: string;
  doctor: string;
  date: string;
  time: string;
  address: string;
  token: string;
}

const AppointmentConfirmation = () => {
  const { state } = useLocation() as { state: ConfirmationState | null };
  const navigate = useNavigate();
  const { setActiveAppointment, addVisit } = usePatient();

  useEffect(() => {
    if (!state) return;
    setActiveAppointment({
      token: state.token,
      clinic: state.clinic,
      doctor: state.doctor,
      date: state.date,
      time: state.time,
      address: state.address,
      status: "waiting",
      estimatedWaitMins: 15,
      patientsAhead: 4,
    });
    addVisit({
      clinicId: `clinic-${state.token}`,
      clinicName: state.clinic,
      date: `${state.date} at ${state.time}`,
    });
  }, [state, setActiveAppointment, addVisit]);

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No appointment data found.</p>
          <Button
            className="mt-4"
            onClick={() => navigate("/patient")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          Appointment Booked!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You are now in the queue.
        </p>

        <dl className="mt-6 space-y-3 text-left text-sm">
      {/* TOKEN */}
      <div className="flex items-start gap-4 rounded-xl bg-muted/50 px-6 py-6">
        <Hash className="mt-1 h-5 w-5 shrink-0 text-primary" />
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Your Token
          </dt>
          <dd className="font-extrabold text-primary text-6xl tracking-widest leading-none mt-1">
            {state.token}
          </dd>
        </div>
      </div>

      {/* DATE */}
      <div className="flex items-start gap-3 px-4 py-1">
        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <dt className="text-xs text-muted-foreground">Date & Time</dt>
          <dd className="font-medium text-foreground">
            {state.date} at {state.time}
          </dd>
        </div>
      </div>

      {/* CLINIC */}
      <div className="flex items-start gap-3 px-4 py-1">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <dt className="text-xs text-muted-foreground">Clinic</dt>
          <dd className="font-medium text-foreground">{state.clinic}</dd>
          <dd className="text-xs text-muted-foreground">{state.address}</dd>
        </div>
      </div>

      {/* DOCTOR */}
      <div className="flex items-start gap-3 px-4 py-1">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <dt className="text-xs text-muted-foreground">Doctor</dt>
          <dd className="font-medium text-foreground">{state.doctor}</dd>
        </div>
      </div>
    </dl>


        <div className="mt-8 space-y-3">
          <Button
            className="w-full"
            onClick={() =>
            navigate("/track", {
            state: state,
           })
          }
        >
            Track Live Queue
          </Button>


          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/patient")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
