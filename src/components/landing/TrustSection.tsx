import SectionWrapper from "./SectionWrapper";
import { Star } from "lucide-react";

const logos = ["CityHealth Clinic", "MediCare Labs", "PrimeLife Diagnostics", "HealthFirst Centre", "Apollo Micro"];

const testimonials = [
  { quote: "QueueSmart cut our average patient wait from 50 minutes to under 15. The staff love it.", name: "Dr. Ananya Desai", role: "Founder, CityHealth Clinic" },
  { quote: "We saw a 40% drop in no-shows within the first month. Patients actually know when to arrive now.", name: "Rajesh Iyer", role: "Manager, MediCare Labs" },
  { quote: "Setup was effortless. Our reception team was trained in under an hour.", name: "Dr. Kavita Nair", role: "Director, PrimeLife Diagnostics" },
];

const TrustSection = () => (
  <SectionWrapper id="trust">
    {/* Logos */}
    <div className="flex flex-wrap items-center justify-center gap-8">
      {logos.map((l) => (
        <span key={l} className="text-sm font-semibold text-muted-foreground/60">{l}</span>
      ))}
    </div>

    {/* Testimonials */}
    <div className="mt-14 grid gap-6 md:grid-cols-3">
      {testimonials.map((t) => (
        <div key={t.name} className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex gap-0.5 text-primary">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
          <div className="mt-4">
            <p className="text-sm font-semibold">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.role}</p>
          </div>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default TrustSection;
