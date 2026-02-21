import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Hash, MapPin, CalendarCheck } from "lucide-react";
import type { UserRole } from "./RoleToggle";
import RoleToggle from "./RoleToggle";

const content = {
  patient: {
    headline: <>Skip Waiting Rooms. <span className="text-primary">Book Clinics Near You.</span></>,
    subtext: "Find nearby clinics, take a token, and arrive just in time — no app install needed.",
    primaryBtn: "Find Clinics Near Me",
    secondaryBtn: "Search by Location",
  },
  clinic: {
    headline: <>Smart Queue Management for <span className="text-primary">Modern Clinics</span></>,
    subtext: "Reduce crowding, manage walk-ins, and improve patient flow with a digital token system.",
    primaryBtn: "Request Onboarding",
    secondaryBtn: "Book a Demo",
  },
};

interface HeroProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const Hero = ({ role, onRoleChange }: HeroProps) => {
  const c = content[role];
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="section-padding overflow-hidden">
      <div className="section-container">
        <div className="mb-10">
          <RoleToggle role={role} onChange={onRoleChange} />
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left */}
          <div key={role} className="max-w-xl animate-fade-in">
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {c.headline}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground md:text-xl">{c.subtext}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" onClick={() => scrollTo("#cta")}>{c.primaryBtn}</Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo("#cta")}>{c.secondaryBtn}</Button>
            </div>
          </div>

          {/* Right — Mock product card */}
          <div className="flex justify-center animate-fade-in [animation-delay:150ms]">
            {role === "patient" ? (
              <Card className="w-full max-w-sm border border-border shadow-xl">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nearby Clinics</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                      <MapPin className="h-3 w-3" /> GPS Active
                    </span>
                  </div>
                  {[
                    { name: "CityCare Clinic", spec: "General Physician", dist: "0.8 km" },
                    { name: "Apollo Family Clinic", spec: "Pediatrician", dist: "1.2 km" },
                    { name: "GreenLife Diagnostics", spec: "Dentist", dist: "2.1 km" },
                  ].map((cl) => (
                    <div key={cl.name} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                      <div>
                        <p className="text-sm font-semibold">{cl.name}</p>
                        <p className="text-xs text-muted-foreground">{cl.spec} · {cl.dist}</p>
                      </div>
                      <CalendarCheck className="h-4 w-4 text-primary" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full max-w-sm border border-border shadow-xl">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Queue</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Active
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex h-28 w-28 animate-pulse-token items-center justify-center rounded-full border-4 border-primary/20 bg-primary/5">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Your Token</p>
                        <p className="font-display text-3xl font-bold text-primary">B-17</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-secondary p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Hash className="h-3.5 w-3.5" />
                        <span className="text-xs">Now Serving</span>
                      </div>
                      <p className="mt-1 font-display text-lg font-bold">B-12</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs">Est. Wait</span>
                      </div>
                      <p className="mt-1 font-display text-lg font-bold">~18 min</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>5 patients ahead of you</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
