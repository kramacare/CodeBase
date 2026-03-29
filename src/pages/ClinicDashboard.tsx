import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, SkipForward, ArrowRightCircle, Plus, Settings, Clock, User } from "lucide-react";
import { useQueue } from "@/context/QueueContext";

const ClinicDashboard = () => {
  const [name, setName] = useState("");
  const [clinicProfile, setClinicProfile] = useState<any>(null);
  const [message, setMessage] = useState<{text: string; type: "success" | "error"} | null>(null);
  const {
    queue,
    nextPatient,
    skipPatient,
    addPatient,
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

  // Get clinic ID from localStorage
  const getClinicId = () => {
    try {
      return localStorage.getItem("clinic_id");
    } catch (error) {
      setMessage({text: "Error getting clinic_id", type: "error"});
      return null;
    }
  };

  // Fetch clinic data
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

  const handleDeskAdd = () => {
    if (!name.trim()) return;
    addPatient(name, "desk");
    setName("");
  };

  return (
    <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Top bar: title + profile circle */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground">Clinic Dashboard</h1>
            <Link
              to="/clinic/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00555A] text-white hover:opacity-90 transition-opacity"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>

          {/* Dashboard Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link to="/clinic/manage-time">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center text-center min-h-[140px] justify-center">
                <Settings className="h-10 w-10 text-[#00555A] mb-3" />
                <h3 className="font-semibold text-foreground">Manage Time</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Set clinic hours and schedules
                </p>
              </div>
            </Link>

            <Link to="/clinic/control-queue">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center text-center min-h-[140px] justify-center">
                <Users className="h-10 w-10 text-[#00555A] mb-3" />
                <h3 className="font-semibold text-foreground">Control Queue</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage patient queue
                </p>
              </div>
            </Link>
          </div>

          {/* Logged in clinic info */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Logged in as <strong>{clinicProfile ? clinicProfile.clinic_name : 'Clinic'}</strong> ({clinicProfile ? clinicProfile.email : 'Loading...'})
          </p>
        </div>
      </div>
  );
};

export default ClinicDashboard;
