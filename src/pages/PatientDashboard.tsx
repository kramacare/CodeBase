import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePatient } from "@/context/PatientContext";
import { useQueue } from "@/context/QueueContext";
import { Button } from "@/components/ui/button";
import {
  User,
  CalendarCheck,
  Star,
  Clock,
  Hash,
  Stethoscope,
  UserCheck,
} from "lucide-react";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { profile } = usePatient();
  const { currentToken, queueStats, fetchQueueStats } = useQueue();
  const [patientToken, setPatientToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get logged-in patient's email to fetch their token
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      fetchPatientToken(user.email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPatientToken = async (patientEmail: string) => {
    try {
      // Try to find patient's token by their email/phone
      const response = await fetch(`http://localhost:8000/queue/patient-dashboard/${patientEmail}?clinic_id=ALL`);
      if (response.ok) {
        const data = await response.json();
        if (data.your_token) {
          setPatientToken({
            token: `A-${data.your_token.token_number}`,
            clinic: "Current Clinic",
            doctor: "Available Doctor",
            date: "Today",
            time: "Now",
            address: "Clinic Address",
            status: data.status,
            estimatedWaitMins: data.patients_ahead * 5,
            patientsAhead: data.patients_ahead
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch patient token:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Top bar: title + profile circle */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <Link
            to="/patient/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00555A] text-white hover:opacity-90 transition-opacity"
            aria-label="Profile"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>

        {/* Two main options */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Link to="/patient/find-clinics">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center text-center min-h-[140px] justify-center">
              <CalendarCheck className="h-10 w-10 text-[#00555A] mb-3" />
              <h3 className="font-semibold text-foreground">Book appointment</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Find clinics by location and book
              </p>
            </div>
          </Link>
          <Link to="/confirmation">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center text-center min-h-[140px] justify-center">
              <Hash className="h-10 w-10 text-[#00555A] mb-3" />
              <h3 className="font-semibold text-foreground">My appointments</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                View your appointment tokens
              </p>
            </div>
          </Link>
          <Link to="/patient/reviews">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center text-center min-h-[140px] justify-center">
              <Star className="h-10 w-10 text-[#00555A] mb-3" />
              <h3 className="font-semibold text-foreground">Write review</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Review clinics you&apos;ve visited
              </p>
            </div>
          </Link>
        </div>

        {/* Appointment details – only if they have an active booking */}
        {patientToken && (
          <>
            {/* Token Details Section */}
            <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Hash className="h-5 w-5 text-[#00555A]" />
                Your Appointment Details
              </h2>
              <div className="space-y-4">
                {/* Your Token */}
                <div className="flex items-center gap-3 rounded-lg bg-[#00555A]/10 px-4 py-3">
                  <Hash className="h-5 w-5 text-[#00555A]" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Your Token</p>
                    <p className="text-3xl font-bold text-[#00555A] tracking-wider">
                      {patientToken.token}
                    </p>
                  </div>
                </div>

                {/* Currently Serving */}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Currently serving: <strong className="text-[#00555A]">
                      {patientToken.token_number ? `A-${patientToken.token_number}` : 'No one'}
                    </strong>
                  </span>
                </div>

                {/* Patients Ahead */}
                <div className="flex items-center gap-3 text-sm">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Patients ahead: <strong>{patientToken.patients_ahead || 0}</strong>
                  </span>
                </div>

                {/* Estimated Wait */}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Est. wait time:{" "}
                    <strong>
                      {patientToken.estimatedWaitMins || 0} mins
                    </strong>
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 text-sm">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Status:{" "}
                    <strong className="capitalize">
                      {patientToken.status || 'waiting'}
                    </strong>
                  </span>
                </div>

                <div className="pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      navigate("/track", {
                        state: {
                          token: patientToken.token,
                          clinic: patientToken.clinic,
                          doctor: patientToken.doctor,
                          date: patientToken.date,
                          time: patientToken.time,
                          address: patientToken.address,
                        },
                      })
                    }
                  >
                    Track queue
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Queue Stats - Show real data from backend */}
        {queueStats && (
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Total Waiting</h3>
              <p className="text-3xl font-bold text-[#00555A]">{queueStats.total_waiting}</p>
              <p className="text-sm text-muted-foreground">patients in queue</p>
            </div>
            
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Currently Serving</h3>
              <p className="text-3xl font-bold text-green-600">{queueStats.currently_serving}</p>
              <p className="text-sm text-muted-foreground">token number</p>
            </div>
            
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Completed Today</h3>
              <p className="text-3xl font-bold text-green-600">{queueStats.completed_today}</p>
              <p className="text-sm text-muted-foreground">patients</p>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Logged in as <strong>{profile.name}</strong> ({profile.email})
        </p>
      </main>
    </div>
  );
};

export default PatientDashboard;
