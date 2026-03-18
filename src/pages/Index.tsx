import Footer from "@/components/landing/Footer";
import TrustSection from "@/components/landing/TrustSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  MapPin,
  Ticket,
  BarChart3,
  Clock,
  Users,
  UserCheck,
  SkipForward,
  Activity,
  Search,
  TicketCheck,
  Bell,
} from "lucide-react";

const Index = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Stop Waiting in{" "}
            <span className="bg-gradient-to-r from-[#00555A] to-[#003d42] bg-clip-text text-transparent">
              Clinic Queues
            </span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground">
            Never sit in crowded waiting rooms again. Track your turn live and
            arrive exactly when it's time. Krama helps clinics manage flow
            and helps patients save hours.
          </p>

          <div className="mt-8 flex gap-4 flex-wrap">
            <Link
              to="/patient/login"
              className="rounded-lg bg-primary px-6 py-3 text-white font-medium shadow hover:shadow-lg transition"
            >
              Patient Login
            </Link>

            <Link
              to="/clinic/login"
              className="rounded-lg border px-6 py-3 font-medium hover:bg-muted transition"
            >
              Clinic Login
            </Link>
          </div>

          {/* TRUST METRICS */}
          <div className="mt-14 flex flex-wrap gap-10">
            <div>
              <p className="text-3xl font-bold text-primary">10+</p>
              <p className="text-sm text-muted-foreground">Clinics Interested</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Patients Expected</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">Waiting Chaos</p>
            </div>
          </div>
        </div>

        {/* TOKEN PREVIEW CARD */}
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-3xl"></div>

          <div className="relative rounded-2xl border bg-white shadow-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">Live Queue</p>

            <div className="mt-4 text-5xl font-bold text-primary">A-17</div>
            <p className="mt-2 text-muted-foreground">Your Token</p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-muted-foreground">Now Serving</p>
                <p className="font-semibold text-lg">A-12</p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-muted-foreground">Est. Wait</p>
                <p className="font-semibold text-lg">18 mins</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              5 patients ahead of you
            </p>
          </div>
        </div>
      </section>


      {/* DIVIDER */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-px bg-border/60"></div>
      </div>

      {/* PROBLEM SECTION */}
      <section className="bg-muted/40 py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Clinic Waiting Rooms Are Inefficient
          </h2>

          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto text-[15px] leading-relaxed">
            Patients often spend hours waiting without knowing their turn, while
            clinics struggle to manage walk-ins, queues, and reception workload
            efficiently.
          </p>

          <div className="mt-16 grid md:grid-cols-4 gap-6">
            {[
              "Long and unpredictable waiting times",
              "No visibility into queue position",
              "Overcrowded waiting areas",
              "Reception staff constantly overloaded",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border bg-white px-8 py-7 shadow-sm transition hover:shadow-lg hover:-translate-y-[2px]"
              >
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            A Smarter Way to Manage Clinic Visits
          </h2>

          <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">
            Krama improves patient experience while giving clinics complete
            control over daily flow and crowd management.
          </p>

          <div className="mt-14 grid md:grid-cols-2 gap-10">
            <div className="rounded-2xl border bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-6">For Patients</h3>
              <div className="space-y-5">
                <Feature icon={MapPin} text="Find nearby clinics instantly" />
                <Feature icon={Ticket} text="Get a digital token before arriving" />
                <Feature icon={BarChart3} text="Track queue position in real time" />
                <Feature icon={Clock} text="Arrive exactly when it's your turn" />
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-6">For Clinics</h3>
              <div className="space-y-5">
                <Feature icon={Users} text="Manage walk-in patients efficiently" />
                <Feature icon={UserCheck} text="Doctor-wise queue management" />
                <Feature icon={SkipForward} text="Next / Skip patient controls" />
                <Feature icon={Activity} text="Reduce reception chaos and crowding" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-muted/40 py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>

          <div className="mt-14 grid md:grid-cols-4 gap-10">
            <Step icon={Search} title="Search Clinics" desc="Find nearby clinics using location" />
            <Step icon={TicketCheck} title="Get Token" desc="Join the queue digitally" />
            <Step icon={BarChart3} title="Track Live" desc="See queue updates in real time" />
            <Step icon={Bell} title="Visit On Time" desc="Arrive when notified" />
          </div>
        </div>
      </section>

      {/* FINAL LOGIN CTA */}
      <section className="border-t border-border bg-secondary/30 py-16">
        <div className="section-container text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Ready to use Krama?
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/patient/login">
              <Button size="lg">Patient Login</Button>
            </Link>

            <Link to="/clinic/login">
              <Button size="lg" variant="outline">
                Clinic Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <TrustSection />
      <Footer />
    </div>
  );
};

const Feature = ({ icon: Icon, text }: any) => (
  <div className="flex items-start gap-4">
    <Icon className="text-primary mt-1" size={20} />
    <p className="text-muted-foreground">{text}</p>
  </div>
);

const Step = ({ icon: Icon, title, desc }: any) => (
  <div>
    <Icon className="mx-auto text-primary mb-4" size={28} />
    <p className="font-medium">{title}</p>
    <p className="text-sm text-muted-foreground mt-2">{desc}</p>
  </div>
);

export default Index;
