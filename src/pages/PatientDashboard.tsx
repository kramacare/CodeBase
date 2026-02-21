import { useEffect } from "react";
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
  const {
    profile,
    activeAppointment,
    clearActiveAppointment,
  } = usePatient();
  const { currentToken } = useQueue();

  // Calculate what token is currently serving and patients ahead
  const getTokenNumber = (token: string) => {
    const match = token.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const patientTokenNum = activeAppointment
    ? getTokenNumber(activeAppointment.token)
    : 0;
  const patientsAhead = Math.max(0, patientTokenNum - currentToken);
  const nowServingToken = `A-${currentToken}`;

  // Automatically clear appointment when patient's token is served (when next patient goes in)
  useEffect(() => {
    if (activeAppointment && currentToken > 0 && patientTokenNum > 0) {
      // Clear when currentToken >= patientTokenNum (their turn has been served)
      if (currentToken >= patientTokenNum) {
        clearActiveAppointment();
      }
    }
  }, [currentToken, activeAppointment, patientTokenNum, clearActiveAppointment]);

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
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <Link to="/patient/find-clinics">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center text-center min-h-[140px] justify-center">
              <CalendarCheck className="h-10 w-10 text-[#00555A] mb-3" />
              <h3 className="font-semibold text-foreground">Book appointment</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Find clinics by location and book
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
        {activeAppointment && (
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
                      {activeAppointment.token}
                    </p>
                  </div>
                </div>

                {/* Currently Serving */}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Currently serving: <strong className="text-[#00555A]">{nowServingToken}</strong>
                  </span>
                </div>

                {/* Patients Ahead */}
                <div className="flex items-center gap-3 text-sm">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Patients ahead: <strong>{patientsAhead}</strong>
                  </span>
                </div>

                {/* Estimated Wait */}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Est. wait time:{" "}
                    <strong>
                      {activeAppointment.estimatedWaitMins ?? patientsAhead * 5} mins
                    </strong>
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 text-sm">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Status:{" "}
                    <strong className="capitalize">
                      {activeAppointment.status.replace("_", " ")}
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
                          token: activeAppointment.token,
                          clinic: activeAppointment.clinic,
                          doctor: activeAppointment.doctor,
                          date: activeAppointment.date,
                          time: activeAppointment.time,
                          address: activeAppointment.address,
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

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Logged in as <strong>{profile.name}</strong> ({profile.email})
        </p>
      </main>
    </div>
  );
};

export default PatientDashboard;
