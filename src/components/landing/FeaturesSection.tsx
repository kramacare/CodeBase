import SectionWrapper from "./SectionWrapper";
import { QrCode, Radio, Clock, Stethoscope, SkipForward, Smartphone, MapPin, Search, CalendarCheck, BellRing, BarChart3 } from "lucide-react";
import type { UserRole } from "./RoleToggle";

const patientFeatures = [
  { icon: MapPin, title: "Find Clinics via GPS", desc: "Discover nearby clinics instantly using your device location." },
  { icon: Search, title: "Search by Locality", desc: "Search clinics by area, name, or doctor specialization." },
  { icon: CalendarCheck, title: "Book Appointments", desc: "Pick a doctor, choose a time slot, and confirm in seconds." },
  { icon: Radio, title: "Track Live Queue", desc: "Watch your queue position update in real time from anywhere." },
  { icon: BellRing, title: "Get Alerts Before Turn", desc: "Receive a notification when it's almost your turn." },
  { icon: Smartphone, title: "No App Install", desc: "Works in any mobile browser — zero friction." },
];

const clinicFeatures = [
  { icon: QrCode, title: "QR-Based Token Entry", desc: "Patients scan a QR at the clinic to instantly join the queue." },
  { icon: Stethoscope, title: "Doctor-wise Queues", desc: "Separate queues per doctor for organized flow." },
  { icon: SkipForward, title: "Next / Skip Controls", desc: "Staff can skip absent patients and call the next one." },
  { icon: Radio, title: "Live Queue Dashboard", desc: "Real-time view of all queues, tokens, and wait times." },
  { icon: Clock, title: "Estimated Wait Time", desc: "Transparent wait estimates keep patients informed." },
  { icon: BarChart3, title: "Analytics (Coming Soon)", desc: "Track patient flow, peak hours, and queue performance." },
];

const titles = {
  patient: { heading: <>Find & Book Clinics <span className="text-primary">Effortlessly</span></>, sub: "Everything a patient needs for a hassle-free clinic visit." },
  clinic: { heading: <>Smart Queue Management for <span className="text-primary">Modern Clinics</span></>, sub: "Everything you need to eliminate waiting room chaos." },
};

const FeaturesSection = ({ role = "patient" }: { role?: UserRole }) => {
  const features = role === "patient" ? patientFeatures : clinicFeatures;
  const t = titles[role] ?? titles.patient;

  return (
    <SectionWrapper id="features">
      <div key={role} className="animate-fade-in">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">{t.heading}</h2>
          <p className="mt-3 text-muted-foreground">{t.sub}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FeaturesSection;
