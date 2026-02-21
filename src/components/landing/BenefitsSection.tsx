import SectionWrapper from "./SectionWrapper";
import { CheckCircle2 } from "lucide-react";
import type { UserRole } from "./RoleToggle";

const patientBenefits = [
  "No more crowded waiting rooms",
  "Save hours every clinic visit",
  "Real-time queue position updates",
  "Predictable, stress-free visits",
  "No app downloads — works on any browser",
];

const clinicBenefits = [
  "Organized, predictable patient flow",
  "Less reception stress and chaos",
  "Fair, transparent token system",
  "Better patient experience and retention",
  "Doctor-wise queue management dashboard",
];

const config = {
  patient: { title: <>Why Patients <span className="text-primary">Love It</span></>, items: patientBenefits, accent: false },
  clinic: { title: <>Why Clinics <span className="text-primary">Choose Us</span></>, items: clinicBenefits, accent: true },
};

const BenefitsSection = ({ role = "patient" }: { role?: UserRole }) => {
  const c = config[role] ?? config.patient;

  return (
    <SectionWrapper id="benefits">
      <div key={role} className="animate-fade-in">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">{c.title}</h2>
        </div>
        <div className="mx-auto mt-12 max-w-lg">
          <div className={`rounded-xl border p-8 ${c.accent ? "border-accent/30 bg-accent/5" : "border-primary/30 bg-primary/5"}`}>
            <ul className="space-y-4">
              {c.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${c.accent ? "text-accent" : "text-primary"}`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default BenefitsSection;
