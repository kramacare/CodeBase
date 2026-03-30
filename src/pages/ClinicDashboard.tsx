import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Settings, User, Eye } from "lucide-react";
import { useQueue } from "@/context/QueueContext";

const ClinicDashboard = () => {
  const [clinicProfile, setClinicProfile] = useState<any>(null);
  const [message, setMessage] = useState<{text: string; type: "success" | "error"} | null>(null);
  const {
    queue,
    nextPatient,
    skipPatient,
    currentToken,
    completedCount,
    skippedCount,
    totalToday,
  } = useQueue();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getClinicId = () => {
    try {
      return localStorage.getItem("clinic_id");
    } catch (error) {
      setMessage({text: "Error getting clinic_id", type: "error"});
      return null;
    }
  };

  useEffect(() => {
    const fetchClinicData = async () => {
      const clinicId = getClinicId();
      if (!clinicId) return;
      try {
        const response = await fetch(`http://localhost:8000/auth/clinic/data?clinic_id=${clinicId}`);
        if (response.ok) {
          const data = await response.json();
          setClinicProfile(data);
        }
      } catch (error) {
        setMessage({text: "Error fetching clinic data", type: "error"});
      }
    };
    fetchClinicData();
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Clinic Dashboard</h1>
          <Link
            to="/clinic/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00555A] text-white hover:opacity-90 transition-opacity"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/clinic/manage-time">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center text-center min-h-[140px] justify-center">
              <Settings className="h-10 w-10 text-[#00555A] mb-3" />
              <h3 className="font-semibold text-foreground">Manage Time</h3>
              <p className="mt-1 text-sm text-muted-foreground">Set clinic hours and schedules</p>
            </div>
          </Link>

          <Link to="/clinic/control-queue">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center text-center min-h-[140px] justify-center">
              <Users className="h-10 w-10 text-[#00555A] mb-3" />
              <h3 className="font-semibold text-foreground">Control Queue</h3>
              <p className="mt-1 text-sm text-muted-foreground">Manage patient queue</p>
            </div>
          </Link>

          <Link to="/clinic/look">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center text-center min-h-[140px] justify-center">
              <Eye className="h-10 w-10 text-[#00555A] mb-3" />
              <h3 className="font-semibold text-foreground">Look</h3>
              <p className="mt-1 text-sm text-muted-foreground">Search patient records</p>
            </div>
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Logged in as <strong>{clinicProfile?.clinic_name || 'Clinic'}</strong>
        </p>
      </div>
    </div>
  );
};

export default ClinicDashboard;
