import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueue } from "@/context/QueueContext";
import { Eye, Settings, User, Users } from "lucide-react";

const actions = [
  {
    to: "/clinic/manage-time",
    title: "Manage Time",
    icon: Settings,
  },
  {
    to: "/clinic/control-queue",
    title: "Control Queue",
    icon: Users,
  },
  {
    to: "/clinic/look",
    title: "Look Up Patients",
    icon: Eye,
  },
];

const ClinicDashboard = () => {
  const [clinicProfile, setClinicProfile] = useState<any>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const { fetchQueueForClinic } = useQueue();

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
      setMessage({ text: "Error getting clinic_id", type: "error" });
      return null;
    }
  };

  useEffect(() => {
    const clinicId = getClinicId();
    if (!clinicId) {
      return;
    }

    void fetchQueueForClinic(clinicId);

    const fetchClinicData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/auth/clinic/data?clinic_id=${clinicId}`);
        if (response.ok) {
          const data = await response.json();
          setClinicProfile(data);
        }
      } catch (error) {
        setMessage({ text: "Error fetching clinic data", type: "error" });
      }
    };

    void fetchClinicData();
  }, [fetchQueueForClinic]);

  return (
    <div className="min-h-screen bg-background">
      {message && (
        <div className="fixed right-4 top-4 z-50 rounded-full bg-foreground px-4 py-2 text-sm text-white shadow-lg">
          {message.text}
        </div>
      )}

      <main className="section-container px-4 py-8 md:px-8 md:py-10">
        <section className="rounded-[32px] bg-primary px-6 py-8 text-primary-foreground shadow-[0_24px_70px_-36px_rgba(31,92,84,0.9)] md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-primary-foreground/70">Clinic Dashboard</p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                {clinicProfile?.clinic_name || "Clinic"}
              </h1>
              <p className="mt-3 text-primary-foreground/78">
                Keep queue control simple and visible.
              </p>
            </div>

            <Link
              to="/clinic/profile"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Clinic profile"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {actions.map((action) => (
              <Link
                key={action.title}
                to={action.to}
                className="rounded-[22px] bg-white/10 px-4 py-5 transition hover:bg-white/15"
              >
                <action.icon className="h-7 w-7 text-white" />
                <p className="mt-4 text-lg font-bold text-white">{action.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ClinicDashboard;
