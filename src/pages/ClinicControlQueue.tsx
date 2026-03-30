import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, SkipForward, ArrowRightCircle, RefreshCw, Clock, Phone, Mail, CheckCircle } from "lucide-react";

interface BookedPatient {
  id: number;
  token: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  doctor_name: string;
  date: string;
  time: string;
  status: string;
}

interface ServingPatient {
  id: number;
  token: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  startTime: Date;
}

const ClinicControlQueue = () => {
  const [clinicId, setClinicId] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bookedPatients, setBookedPatients] = useState<BookedPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentServing, setCurrentServing] = useState<ServingPatient | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [message, setMessage] = useState<{text: string; type: "success" | "error"} | null>(null);

  // Get clinic_id from localStorage on mount
  useEffect(() => {
    const clinicStr = localStorage.getItem("clinic_id");
    if (clinicStr) {
      setClinicId(clinicStr);
      fetchBookedPatients(clinicStr);
      fetchCompletedCount(clinicStr);
    }
  }, []);

  const fetchBookedPatients = async (clinicId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/auth/clinic/appointments?clinic_id=${clinicId}`);
      if (response.ok) {
        const data = await response.json();
        // Also filter in frontend to ensure only today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = (data.appointments || []).filter((apt: any) => apt.date === today);
        setBookedPatients(todayAppointments);
      }
    } catch (error) {
      console.error("Failed to fetch booked patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedCount = async (clinicId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/auth/clinic/completed-appointments?clinic_id=${clinicId}`);
      if (response.ok) {
        const data = await response.json();
        setCompletedCount(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch completed count:", error);
    }
  };

  const handleNext = async () => {
    if (!clinicId || bookedPatients.length === 0) return;

    // Get first patient in queue
    const nextPatient = bookedPatients[0];
    
    try {
      const response = await fetch("http://localhost:8000/auth/clinic/serve-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: clinicId,
          appointment_id: nextPatient.id
        })
      });

      if (response.ok) {
        setCurrentServing({
          id: nextPatient.id,
          token: nextPatient.token,
          patient_name: nextPatient.patient_name,
          patient_email: nextPatient.patient_email,
          patient_phone: nextPatient.patient_phone,
          startTime: new Date()
        });
        setMessage({text: `${nextPatient.patient_name} is now being served`, type: "success"});
      }
    } catch (error) {
      setMessage({text: "Failed to serve patient", type: "error"});
    }
  };

  const handleServed = async () => {
    if (!clinicId || !currentServing) return;

    try {
      const response = await fetch("http://localhost:8000/auth/clinic/finish-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: clinicId,
          appointment_id: currentServing.id
        })
      });

      if (response.ok) {
        setMessage({text: `${currentServing.patient_name} marked as served`, type: "success"});
        setCurrentServing(null);
        fetchBookedPatients(clinicId);
        fetchCompletedCount(clinicId);
      }
    } catch (error) {
      setMessage({text: "Failed to complete patient", type: "error"});
    }
  };

  const handleSkip = async () => {
    if (!clinicId || bookedPatients.length === 0) return;

    const patientToSkip = bookedPatients[0];
    
    try {
      const response = await fetch("http://localhost:8000/auth/clinic/skip-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: clinicId,
          appointment_id: patientToSkip.id
        })
      });

      if (response.ok) {
        setSkippedCount(prev => prev + 1);
        setMessage({text: `${patientToSkip.patient_name} skipped and moved to end`, type: "success"});
        fetchBookedPatients(clinicId);
      }
    } catch (error) {
      setMessage({text: "Failed to skip patient", type: "error"});
    }
  };

  // Update elapsed time every second when a patient is being served
  useEffect(() => {
    if (currentServing && currentServing.startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const start = new Date(currentServing.startTime!);
        const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedTime(diff);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [currentServing]);

  const handleRefreshQueue = () => {
    if (window.confirm("Are you sure you want to refresh the queue?")) {
      if (clinicId) {
        fetchBookedPatients(clinicId);
        fetchCompletedCount(clinicId);
      }
    }
  };

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link
            to="/clinic"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-semibold text-foreground">Control Queue</span>
        </div>
      </header>

      {/* Message Toast */}
      {message && (
        <div className={`fixed top-16 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-fade-in ${
          message.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {message.text}
        </div>
      )}

      <main className="mx-auto max-w-3xl px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-[#0F172A] mb-6">Clinic Queue Control</h1>

          {/* SUMMARY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Waiting</p>
              <p className="text-2xl font-bold text-[#0F172A]">{bookedPatients.length}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-[#FFC107]">
                {completedCount}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Serving</p>
              <p className="text-2xl font-bold text-[#00555A]">
                {currentServing ? "1" : "0"}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Skipped</p>
              <p className="text-2xl font-bold text-[#FFA000]">
                {skippedCount}
              </p>
            </div>
          </div>

          {/* NOW SERVING */}
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">Now Serving</p>
            <div className="text-5xl font-extrabold text-[#0F172A]">
              {currentServing ? currentServing.token : "—"}
            </div>
            
            {currentServing ? (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-[#0F172A]">{currentServing.patient_name}</p>
                <p className="text-sm text-gray-600">{currentServing.patient_email}</p>
                <p className="text-sm text-gray-600">{currentServing.patient_phone || "No phone"}</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Elapsed: {formatTime(elapsedTime)}</span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-gray-500">No patient currently being served</p>
            )}
          </div>

          {/* CONTROLS */}
          <div className="flex gap-4 mb-6">
            {currentServing ? (
              <Button 
                className="flex-1 bg-green-600 text-white hover:opacity-90 rounded-xl transition-all duration-200" 
                onClick={handleServed}
              >
                <CheckCircle className="mr-2" size={18} />
                Served
              </Button>
            ) : (
              <Button 
                className="flex-1 bg-[#00555A] text-white hover:opacity-90 rounded-xl transition-all duration-200" 
                onClick={handleNext}
                disabled={bookedPatients.length === 0}
              >
                <ArrowRightCircle className="mr-2" size={18} />
                Next
              </Button>
            )}

            <Button 
              variant="outline" 
              className="flex-1 border-gray-300 text-[#0F172A] hover:bg-gray-50 rounded-xl transition-all duration-200" 
              onClick={handleSkip}
              disabled={bookedPatients.length === 0}
            >
              <SkipForward className="mr-2" size={18} />
              Skip
            </Button>
          </div>

          {/* QUEUE LIST */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#00555A]" />
                <h2 className="font-semibold text-[#0F172A]">Waiting Queue</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fetchBookedPatients(clinicId)}
                className="text-[#00555A] hover:text-[#00555A]/80"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {bookedPatients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No patients in queue</p>
            ) : (
              bookedPatients.map((patient, i) => (
                <div
                  key={patient.id}
                  className={`rounded-lg px-4 py-3 ${
                    currentServing?.id === patient.id 
                      ? "bg-green-100 border-2 border-green-500" 
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#0F172A]">
                        {patient.token} — {patient.patient_name}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {patient.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {patient.patient_email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.patient_phone || "N/A"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">
                      #{i + 1}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicControlQueue;
