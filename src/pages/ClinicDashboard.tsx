import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, SkipForward, ArrowRightCircle, Plus, Settings, Clock, User } from "lucide-react";
import { useQueue } from "@/context/QueueContext";

const ClinicDashboard = () => {
  const [name, setName] = useState("");
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

  const handleDeskAdd = () => {
    if (!name.trim()) return;
    addPatient(name, "desk");
    setName("");
  };

  return (
    <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-[#0F172A] mb-6">Clinic Dashboard</h1>

          {/* Dashboard Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link to="/clinic/profile">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center text-center min-h-[140px] justify-center">
                <User className="h-10 w-10 text-[#00555A] mb-3" />
                <h3 className="font-semibold text-foreground">Profile Settings</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your profile
                </p>
              </div>
            </Link>
            
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
        </div>
      </div>
  );
};

export default ClinicDashboard;
