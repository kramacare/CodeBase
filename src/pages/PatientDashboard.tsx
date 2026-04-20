import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePatient } from "@/context/PatientContext";
import {
  Hash,
  CalendarCheck,
  Star,
  User,
} from "lucide-react";

type Appointment = {
  id: number;
  clinic_name: string;
  doctor_name: string;
  appointment_token: string;
  date: string;
  time: string;
  status: string;
  address?: string;
};

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { profile } = usePatient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.email) {
        fetchAppointments(user.email);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAppointments = async (patientEmail: string) => {
    try {
      const response = await fetch(`http://localhost:8000/auth/patient/appointments?email=${encodeURIComponent(patientEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentClick = (apt: Appointment) => {
    navigate("/confirmation", {
      state: {
        token: apt.appointment_token,
        clinic: apt.clinic_name,
        doctor: apt.doctor_name,
        date: apt.date,
        time: apt.time,
        address: apt.address || "",
      },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="section-container px-4 py-8 md:px-8 md:py-10">
        <section className="rounded-[32px] bg-primary px-6 py-8 text-primary-foreground shadow-[0_24px_70px_-36px_rgba(31,92,84,0.9)] md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-primary-foreground/70">Patient Dashboard</p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">{profile.name}</h1>
              <p className="mt-3 text-primary-foreground/78">
                {appointments.length > 0 ? "Your appointments are confirmed." : "Book a clinic visit and track it here."}
              </p>
            </div>

            <Link
              to="/patient/profile"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              to="/patient/find-clinics"
              className="rounded-[22px] bg-white/10 px-6 py-6 text-center transition hover:bg-white/20"
            >
              <CalendarCheck className="mx-auto h-8 w-8" />
              <p className="mt-2 text-sm text-primary-foreground/70">Book</p>
              <p className="mt-1 text-xl font-bold text-white">New Appointment</p>
            </Link>
            {appointments.length > 0 ? (
              <Link
                to="/confirmation"
                state={{
                  token: appointments[0].appointment_token,
                  clinic: appointments[0].clinic_name,
                  doctor: appointments[0].doctor_name,
                  date: appointments[0].date,
                  time: appointments[0].time,
                  address: appointments[0].address || "",
                }}
                className="rounded-[22px] bg-white/10 px-6 py-6 text-center transition hover:bg-white/20"
              >
                <Hash className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm text-primary-foreground/70">Appointment</p>
                <p className="mt-1 text-xl font-bold text-white">{appointments[0].appointment_token}</p>
              </Link>
            ) : (
              <Link
                to="/confirmation"
                className="rounded-[22px] bg-white/10 px-6 py-6 text-center transition hover:bg-white/20"
              >
                <Hash className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm text-primary-foreground/70">Appointment</p>
                <p className="mt-1 text-xl font-bold text-white">Booked Appointment</p>
              </Link>
            )}
            <Link
              to="/patient/reviews"
              className="rounded-[22px] bg-white/10 px-6 py-6 text-center transition hover:bg-white/20"
            >
              <Star className="mx-auto h-8 w-8" />
              <p className="mt-2 text-sm text-primary-foreground/70">Review</p>
              <p className="mt-1 text-xl font-bold text-white">Write Feedback</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;
