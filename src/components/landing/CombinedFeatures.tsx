import SectionWrapper from "./SectionWrapper";
import { Radio, Ticket, MapPin, Smartphone, Users, Scale } from "lucide-react";

const features = [
  { icon: Radio, title: "Live Queue Tracking", desc: "Real-time token updates for patients and staff." },
  { icon: Ticket, title: "Smart Token Management", desc: "Automatic digital tokens replace manual numbering." },
  { icon: MapPin, title: "GPS-Based Clinic Discovery", desc: "Patients find the nearest clinics instantly." },
  { icon: Smartphone, title: "Mobile-First System", desc: "Works on any device browser — no app download." },
  { icon: Users, title: "No App Installation", desc: "Zero friction for patients — just scan and go." },
  { icon: Scale, title: "Fair Queue Handling", desc: "Transparent, first-come-first-serve token order." },
];

const CombinedFeatures = () => (
  <SectionWrapper id="features">
    <div className="animate-fade-in">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          Built for <span className="text-primary">Everyone</span>
        </h2>
        <p className="mt-3 text-muted-foreground">Core capabilities that benefit patients and clinics alike.</p>
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

export default CombinedFeatures;
