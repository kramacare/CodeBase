import TrustSection from "@/components/landing/TrustSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarClock,
  Clock,
  Layers3,
  MapPin,
  Search,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Ticket,
  TicketCheck,
  UserCheck,
  Users,
} from "lucide-react";

const heroStats = [
  { value: "10+", label: "Clinics onboarding" },
  { value: "500+", label: "Expected patients" },
  { value: "18m", label: "Average visible wait" },
];

const problemPoints = [
  "Long and unpredictable waiting times",
  "No visibility into queue position",
  "Overcrowded waiting rooms",
  "Reception staff constantly interrupted",
];

const patientFeatures = [
  { icon: MapPin, text: "Find nearby clinics with a simple search flow." },
  { icon: Ticket, text: "Take a digital token before you arrive." },
  { icon: BarChart3, text: "Track position in real time from your phone." },
  { icon: Clock, text: "Reach the clinic close to your actual turn." },
];

const clinicFeatures = [
  { icon: Users, text: "Handle walk-ins and scheduled patients from one flow." },
  { icon: UserCheck, text: "Manage doctor-wise queues with less confusion." },
  { icon: SkipForward, text: "Move to next, skip, and update status quickly." },
  { icon: Activity, text: "Reduce crowding while giving patients live visibility." },
];

const steps = [
  { icon: Search, title: "Search clinics", desc: "Find nearby clinics using your location." },
  { icon: TicketCheck, title: "Get token", desc: "Join the queue digitally in seconds." },
  { icon: BarChart3, title: "Track live", desc: "See updates and estimated wait in real time." },
  { icon: Bell, title: "Arrive on time", desc: "Come in when your turn is close." },
];

const Index = () => {
  return (
    <div className="min-h-screen overflow-hidden">
      <section className="section-container px-4 pb-16 pt-10 md:px-8 md:pb-20 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              Minimal clinic queueing for patients and staff
            </div>

            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Make clinic visits feel calm, clear, and on time.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">
              Krama keeps your existing flow intact while giving the website a cleaner face for patients and clinics.
              Join digitally, track turns live, and reduce crowded waiting rooms.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/patient/login">
                <Button size="lg" className="gap-2">
                  Patient Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/clinic/login">
                <Button size="lg" variant="outline">
                  Clinic Login
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              {heroStats.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-border/70 bg-white/75 p-5 shadow-sm backdrop-blur">
                  <p className="font-display text-3xl font-bold text-primary">{item.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-10 top-8 h-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="glass-panel relative overflow-hidden rounded-[32px] p-6 md:p-8">
              <div className="flex items-center justify-between rounded-full border border-border/70 bg-background/80 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Live queue</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">CityCare Clinic</p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Active</div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-[1fr_0.88fr]">
                <div className="rounded-[28px] bg-primary px-6 py-8 text-primary-foreground shadow-[0_24px_60px_-32px_rgba(31,92,84,0.75)]">
                  <p className="text-sm uppercase tracking-[0.22em] text-primary-foreground/70">Your token</p>
                  <p className="mt-3 font-display text-6xl font-bold">A-17</p>

                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <div className="rounded-[22px] bg-white/10 p-4">
                      <p className="text-xs text-primary-foreground/70">Now serving</p>
                      <p className="mt-2 text-2xl font-semibold">A-12</p>
                    </div>
                    <div className="rounded-[22px] bg-white/10 p-4">
                      <p className="text-xs text-primary-foreground/70">Estimated wait</p>
                      <p className="mt-2 text-2xl font-semibold">18 min</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: CalendarClock, label: "Booked digitally", value: "Today, 10:30 AM" },
                    { icon: Bell, label: "Arrival reminder", value: "Notify 10 minutes before" },
                    { icon: ShieldCheck, label: "Less crowding", value: "Arrive only when needed" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-[24px] border border-border/70 bg-white/80 p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-secondary p-3">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{label}</p>
                          <p className="mt-1 font-medium text-foreground">{value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-dashed border-border bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-accent/25 px-3 py-1 text-sm font-medium text-foreground">
                      5 patients ahead
                    </div>
                    <p className="text-sm text-muted-foreground">Track every update without calling reception.</p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-container px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-4 md:grid-cols-4">
          {problemPoints.map((item) => (
            <div key={item} className="rounded-[26px] border border-border/70 bg-white/80 p-6 shadow-sm">
              <p className="text-sm font-medium leading-7 text-foreground">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container px-4 py-16 md:px-8 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[32px] bg-white/80 p-8 shadow-sm ring-1 ring-border/70">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-secondary p-3">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">For patients</p>
                <h2 className="mt-1 font-display text-3xl font-bold">Know when to leave, not when to wait.</h2>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {patientFeatures.map((feature) => (
                <Feature key={feature.text} icon={feature.icon} text={feature.text} />
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-primary p-8 text-primary-foreground shadow-[0_24px_70px_-36px_rgba(31,92,84,0.85)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Layers3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-primary-foreground/70">For clinics</p>
                <h2 className="mt-1 font-display text-3xl font-bold">Keep the queue moving without changing your system.</h2>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {clinicFeatures.map((feature) => (
                <Feature key={feature.text} dark icon={feature.icon} text={feature.text} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/45 py-16 md:py-20">
        <div className="section-container px-4 md:px-8">
          <div className="rounded-[32px] border border-border/70 bg-white/75 p-8 text-center shadow-sm md:p-12">
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">How it works</p>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">A simpler visit in four small steps.</h2>

            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {steps.map((step) => (
                <Step key={step.title} icon={step.icon} title={step.title} desc={step.desc} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-container px-4 py-16 md:px-8 md:py-20">
        <div className="rounded-[36px] bg-foreground px-8 py-12 text-center text-white shadow-[0_28px_80px_-40px_rgba(10,30,26,0.9)] md:px-12">
          <p className="text-sm uppercase tracking-[0.3em] text-white/55">Ready to use Krama?</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-bold leading-tight md:text-4xl">
            Keep your same workflow and give the product a cleaner first impression.
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/patient/login">
              <Button size="lg" variant="secondary">
                Patient Login
              </Button>
            </Link>
            <Link to="/clinic/login">
              <Button size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10">
                Clinic Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <TrustSection />
    </div>
  );
};

const Feature = ({ icon: Icon, text, dark = false }: any) => (
  <div className="flex items-start gap-4">
    <div className={`mt-1 rounded-2xl p-2.5 ${dark ? "bg-white/10" : "bg-secondary"}`}>
      <Icon className={dark ? "text-white" : "text-primary"} size={18} />
    </div>
    <p className={dark ? "text-primary-foreground/82" : "text-muted-foreground"}>{text}</p>
  </div>
);

const Step = ({ icon: Icon, title, desc }: any) => (
  <div className="rounded-[24px] border border-border/70 bg-background/80 p-6">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
      <Icon className="text-primary" size={22} />
    </div>
    <p className="mt-4 font-semibold">{title}</p>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
  </div>
);

export default Index;
