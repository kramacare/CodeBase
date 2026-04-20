import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePatient } from "@/context/PatientContext";
import { CalendarDays, Clock, Hash, MapPin, Stethoscope, Timer, Users } from "lucide-react";

interface ConfirmationState {
  clinic: string;
  doctor: string;
  date: string;
  time: string;
  address: string;
  token: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
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
  appointment_token: string;
  status: string;
  address?: string;
  created_at: string;
}

interface QueuePosition {
  patients_ahead: number;
  estimated_wait_minutes: number;
  your_position: number;
  total_in_queue: number;
  now_serving_token?: string;
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
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        const response = await fetch(`http://localhost:8000/auth/patient/appointments?email=${user.email}`);
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();
        const today = new Date().toISOString().split("T")[0];
        const todayAppointments = (data.appointments || []).filter((apt: any) => apt.date === today);

        if (todayAppointments.length > 0) {
          const latestAppointment = todayAppointments[0];
          setAppointmentDetails(latestAppointment);

          const queueResponse = await fetch(
            `http://localhost:8000/auth/appointments/queue-position?clinic_id=${latestAppointment.clinic_id}&appointment_token=${latestAppointment.appointment_token}&appointment_id=${latestAppointment.id}`
          );
          if (queueResponse.ok) {
            const queueData = await queueResponse.json();
            setQueuePosition(queueData);
          }
        }
      } catch (error) {
        console.error("Error fetching appointment details:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchAppointmentDetails();
  }, []);

  const token = state?.token || appointmentDetails?.appointment_token || "T-1";
  const clinicName = state?.clinic || appointmentDetails?.clinic_name || "Unknown Clinic";
  const clinicAddress = state?.address || appointmentDetails?.address || "Clinic Address";
  const doctorName = state?.doctor || appointmentDetails?.doctor_name || "Available Doctor";
  const dateText = state?.date || appointmentDetails?.date || "";
  const timeText = state?.time || appointmentDetails?.time || "";
  const patientsAhead = queuePosition?.patients_ahead ?? 0;
  const estimatedWait = queuePosition?.estimated_wait_minutes ?? 0;
  const nowServing = queuePosition?.now_serving_token || token;

  useEffect(() => {
    if (!token || !clinicName || !doctorName || !dateText || !timeText) return;

    setActiveAppointment({
      token,
      clinic: clinicName,
      doctor: doctorName,
      date: dateText,
      time: timeText,
      address: clinicAddress,
      status: appointmentDetails?.status === "serving" ? "with_doctor" : "waiting",
      estimatedWaitMins: estimatedWait,
      patientsAhead,
    });
    addVisit({
      clinicId: `clinic-${token}`,
      clinicName,
      date: `${dateText} at ${timeText}`,
    });
  }, [token, clinicName, doctorName, dateText, timeText, clinicAddress, appointmentDetails, estimatedWait, patientsAhead, setActiveAppointment, addVisit]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!state && !appointmentDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">No appointment data found.</p>
          <Button className="mt-4" onClick={() => navigate("/patient")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-[36px] bg-primary p-8 text-white shadow-[0_28px_80px_-40px_rgba(31,92,84,0.9)]">
          <p className="text-sm uppercase tracking-[0.28em] text-white/70">Your Token</p>
          <p className="mt-4 font-display text-6xl font-bold tracking-tight">{token}</p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-[24px] bg-white/10 p-5">
              <p className="text-sm text-white/70">Now serving</p>
              <p className="mt-3 text-3xl font-bold">{nowServing}</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-5">
              <p className="text-sm text-white/70">Estimated wait</p>
              <p className="mt-3 text-3xl font-bold">{estimatedWait} min</p>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] bg-white/10 p-5">
            <p className="text-sm text-white/70">Patients ahead</p>
            <p className="mt-3 text-3xl font-bold">{patientsAhead}</p>
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-border/70 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <DetailRow icon={MapPin} label="Clinic" value={clinicName} subvalue={clinicAddress} />
            <DetailRow icon={Stethoscope} label="Doctor" value={doctorName} />
            <DetailRow icon={CalendarDays} label="Appointment" value={`${dateText} at ${timeText}`} />
            <div className="grid grid-cols-2 gap-4 rounded-[20px] bg-secondary/60 p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Token</p>
                <p className="mt-1 text-lg font-bold text-foreground">{token}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Position</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {queuePosition ? `${queuePosition.your_position} / ${queuePosition.total_in_queue}` : "1 / 1"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Button variant="outline" className="w-full" onClick={() => navigate("/patient")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
  subvalue,
}: {
  icon: any;
  label: string;
  value: string;
  subvalue?: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="mt-0.5 h-5 w-5 text-primary" />
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
      {subvalue ? <p className="text-sm text-muted-foreground">{subvalue}</p> : null}
    </div>
  </div>
);

export default AppointmentConfirmation;
