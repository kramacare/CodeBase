import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Clock, Settings } from "lucide-react";

const ClinicDashboardNew = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <span className="font-semibold text-foreground">Clinic Dashboard</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-12">
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
              <Clock className="h-10 w-10 text-[#00555A] mb-3" />
              <h3 className="font-semibold text-foreground">Manage Time</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Set clinic hours and schedules
              </p>
            </div>
          </Link>

          <Link to="/clinic/control-queue">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center text-center min-h-[140px] justify-center">
              <Settings className="h-10 w-10 text-[#00555A] mb-3" />
              <h3 className="font-semibold text-foreground">Control Queue</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage patient queue
              </p>
            </div>
          </Link>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">Welcome to QueueSmart</h2>
          <p className="text-gray-600 mb-6">
            Manage your clinic operations efficiently with our comprehensive queue management system.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00555A] mb-2">24/7</div>
              <p className="text-sm text-gray-600">Support</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00555A] mb-2">500+</div>
              <p className="text-sm text-gray-600">Daily Patients</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00555A] mb-2">99.9%</div>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicDashboardNew;
