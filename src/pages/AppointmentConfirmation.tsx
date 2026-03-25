import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePatient } from "@/context/PatientContext";
import { CheckCircle2, MapPin, CalendarDays, Clock, Hash, Users, Timer } from "lucide-react";

interface ConfirmationState {
  clinic: string;
  doctor: string;
  date: string;
  time: string;
  address: string;
  token: string;
}

interface AppointmentDetails {
  id: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  clinic_id: string;
  clinic_name: string;
  doctor_name: string;
  date: string;
  time: string;
  token: string;
  status: string;
  created_at: string;
}

interface QueuePosition {
  patients_ahead: number;
  estimated_wait_minutes: number;
  your_position: number;
  total_in_queue: number;
}

const AppointmentConfirmation = () => {
  const { state } = useLocation() as { state: ConfirmationState | null };
  const navigate = useNavigate();
  const { setActiveAppointment, addVisit } = usePatient();
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [queuePosition, setQueuePosition] = useState<QueuePosition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        // Get patient email from localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          
          // Fetch appointments for this patient
          const response = await fetch(`http://localhost:8000/auth/patient/appointments?email=${user.email}`);
          if (response.ok) {
            const data = await response.json();
            if (data.appointments && data.appointments.length > 0) {
              // Get the most recent appointment
              const latestAppointment = data.appointments[0];
              setAppointmentDetails(latestAppointment);
              
              // Fetch queue position based on clinic_id and token
              const queueResponse = await fetch(
                `http://localhost:8000/auth/appointments/queue-position?clinic_id=${latestAppointment.clinic_id}&appointment_token=${latestAppointment.token}&appointment_id=${latestAppointment.id}`
              );
              if (queueResponse.ok) {
                const queueData = await queueResponse.json();
                setQueuePosition(queueData);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching appointment details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, []);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!state && !appointmentDetails) {
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

  // Use state data if available, otherwise use appointmentDetails from API
  const displayData = state || appointmentDetails;

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          Appointment Booked!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your appointment has been confirmed
        </p>

        {/* Token Display */}
        <div className="mt-6 rounded-xl bg-[#00555A] p-6 text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Hash className="h-6 w-6" />
            <span className="text-sm uppercase tracking-wide">Your Token</span>
          </div>
          <p className="text-5xl font-bold tracking-widest">
            {displayData?.token || "T-1"}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {/* Patient Info */}
          {appointmentDetails && (
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
              <div className="flex-1">
                <dt className="text-xs text-muted-foreground">Patient</dt>
                <dd className="font-medium text-foreground">{appointmentDetails.patient_name}</dd>
                <dd className="text-xs text-muted-foreground">{appointmentDetails.patient_email}</dd>
                <dd className="text-xs text-muted-foreground">{appointmentDetails.patient_phone}</dd>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#00555A]" />
            <div>
              <dt className="text-xs text-muted-foreground">Date & Time</dt>
              <dd className="font-medium text-foreground">
                {displayData?.date || appointmentDetails?.date} at {displayData?.time || appointmentDetails?.time}
              </dd>
            </div>
          </div>

          {/* Clinic */}
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#00555A]" />
            <div>
              <dt className="text-xs text-muted-foreground">Clinic</dt>
              <dd className="font-medium text-foreground">{displayData?.clinic || appointmentDetails?.clinic_name}</dd>
              <dd className="text-xs text-muted-foreground">{displayData?.address || "Clinic Address"}</dd>
            </div>
          </div>

          {/* Doctor */}
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#00555A]" />
            <div>
              <dt className="text-xs text-muted-foreground">Doctor</dt>
              <dd className="font-medium text-foreground">{displayData?.doctor || appointmentDetails?.doctor_name}</dd>
            </div>
          </div>

          {/* Queue Info - Actual from database */}
          {queuePosition && (
            <div className="flex items-start gap-3 rounded-lg bg-orange-50 p-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <div>
                <dt className="text-xs text-muted-foreground">Patients Ahead</dt>
                <dd className="font-medium text-foreground">{queuePosition.patients_ahead} patients</dd>
              </div>
            </div>
          )}

          {/* Estimated Time - Actual from database */}
          {queuePosition && (
            <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
              <Timer className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <div>
                <dt className="text-xs text-muted-foreground">Estimated Wait</dt>
                <dd className="font-medium text-foreground">{queuePosition.estimated_wait_minutes} minutes</dd>
              </div>
            </div>
          )}

          {/* Your Position */}
          {queuePosition && (
            <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-3">
              <Hash className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
              <div>
                <dt className="text-xs text-muted-foreground">Your Position in Queue</dt>
                <dd className="font-medium text-foreground">{queuePosition.your_position} of {queuePosition.total_in_queue}</dd>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="font-medium text-foreground capitalize">
                {appointmentDetails?.status || "booked"}
              </dd>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            className="w-full bg-[#00555A] hover:bg-[#004455]"
            onClick={() => navigate("/track")}
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
