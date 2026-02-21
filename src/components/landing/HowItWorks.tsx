import SectionWrapper from "./SectionWrapper";
import { MapPin, CalendarCheck, Radio, BellRing, QrCode, Ticket, Settings2, Smile } from "lucide-react";
import type { UserRole } from "./RoleToggle";

const patientSteps = [
  { icon: MapPin, title: "Allow Location Access", desc: "Enable GPS to find clinics near you instantly." },
  { icon: CalendarCheck, title: "See Nearby Clinics", desc: "Browse clinics by distance, specialty, and ratings." },
  { icon: Radio, title: "Book Appointment", desc: "Pick a doctor, choose a slot, and confirm your visit." },
  { icon: BellRing, title: "Visit When Notified", desc: "Get alerted when it's your turn — skip the wait." },
];

const clinicSteps = [
  { icon: QrCode, title: "Patients Scan QR", desc: "Patients scan the clinic's QR code on arrival." },
  { icon: Ticket, title: "Tokens Generated", desc: "Digital tokens are assigned automatically." },
  { icon: Settings2, title: "Staff Manages Flow", desc: "Use Next/Skip controls to manage the queue." },
  { icon: Smile, title: "Reduced Waiting Chaos", desc: "Patients arrive on time, reception stays calm." },
];

const titles = {
  patient: { heading: <>How It <span className="text-primary">Works</span></>, sub: "Four simple steps from search to consultation." },
  clinic: { heading: <>How It <span className="text-primary">Works</span></>, sub: "Seamless queue management from scan to service." },
};

const HowItWorks = ({ role = "patient" }: { role?: UserRole }) => {
  const steps = role === "patient" ? patientSteps : clinicSteps;
  const t = titles[role] ?? titles.patient;

  return (
    <SectionWrapper id="how-it-works" bgClassName="bg-secondary/50">
      <div key={role} className="animate-fade-in">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">{t.heading}</h2>
          <p className="mt-3 text-muted-foreground">{t.sub}</p>
        </div>
        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-[3.25rem] hidden h-0.5 bg-border lg:block" aria-hidden />
          {steps.map((s, i) => (
            <div key={s.title} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-background shadow-sm">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="mt-1 text-xs font-bold text-primary">Step {i + 1}</span>
              <h3 className="mt-2 font-display text-base font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default HowItWorks;
