import SectionWrapper from "./SectionWrapper";
import { Clock, Users, Frown, EyeOff, MapPinOff, CalendarOff, ShieldQuestion, Hourglass } from "lucide-react";
import type { UserRole } from "./RoleToggle";

const patientProblems = [
  { icon: Hourglass, title: "Endless Waiting", desc: "Patients wait 45+ minutes with no idea when their turn will come." },
  { icon: Users, title: "Crowded Rooms", desc: "Packed waiting rooms increase infection risk and discomfort." },
  { icon: MapPinOff, title: "Hard to Find Clinics", desc: "No easy way to discover quality clinics nearby." },
  { icon: CalendarOff, title: "No Easy Booking", desc: "Calling to book or walking in leads to wasted time." },
];

const clinicProblems = [
  { icon: Clock, title: "Long Waiting Times", desc: "Patients wait 45+ minutes with no idea when their turn will come." },
  { icon: Users, title: "Crowded Clinics", desc: "Packed waiting rooms increase infection risk and discomfort." },
  { icon: Frown, title: "Patient Frustration", desc: "Uncertainty breeds anxiety — patients leave or complain." },
  { icon: EyeOff, title: "No Queue Visibility", desc: "Reception has no real-time view of queue status or bottlenecks." },
];

const titles = {
  patient: { heading: <>Finding a Doctor Shouldn't Be <span className="text-primary">This Hard</span></>, sub: "Patients struggle with outdated clinic experiences every day." },
  clinic: { heading: <>Waiting Rooms Are <span className="text-primary">Broken</span></>, sub: "Clinics lose patients — and trust — because of outdated queuing." },
};

const ProblemSection = ({ role = "patient" }: { role?: UserRole }) => {
  const problems = role === "patient" ? patientProblems : clinicProblems;
  const t = titles[role] ?? titles.patient;

  return (
    <SectionWrapper id="problems" bgClassName="bg-secondary/50">
      <div key={role} className="animate-fade-in">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">{t.heading}</h2>
          <p className="mt-3 text-muted-foreground">{t.sub}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <div key={p.title} className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default ProblemSection;
