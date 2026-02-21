import SectionWrapper from "./SectionWrapper";
import { MapPin, Ticket, Radio, BellRing, QrCode, Settings2, Smile, CalendarCheck } from "lucide-react";

const patientSteps = [
  { icon: MapPin, text: "Find nearby clinics" },
  { icon: Ticket, text: "Get a digital token" },
  { icon: Radio, text: "Track queue live" },
  { icon: BellRing, text: "Arrive on time" },
];

const clinicSteps = [
  { icon: QrCode, text: "QR token system" },
  { icon: CalendarCheck, text: "Doctor-wise queues" },
  { icon: Settings2, text: "Next / Skip controls" },
  { icon: Smile, text: "Crowd reduction" },
];

const CombinedHowItWorks = () => (
  <SectionWrapper id="how-it-works" bgClassName="bg-secondary/50">
    <div className="animate-fade-in">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          How It <span className="text-primary">Works</span>
        </h2>
        <p className="mt-3 text-muted-foreground">A streamlined experience for both sides.</p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {/* Patients column */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8">
          <h3 className="mb-6 text-center font-display text-lg font-semibold">For Patients</h3>
          <ul className="space-y-5">
            {patientSteps.map((s, i) => (
              <li key={i} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{s.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clinics column */}
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-8">
          <h3 className="mb-6 text-center font-display text-lg font-semibold">For Clinics</h3>
          <ul className="space-y-5">
            {clinicSteps.map((s, i) => (
              <li key={i} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-background">
                  <s.icon className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm font-medium">{s.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </SectionWrapper>
);

export default CombinedHowItWorks;
