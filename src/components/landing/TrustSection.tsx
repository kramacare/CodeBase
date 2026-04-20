import { Star } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const logos = ["CityHealth Clinic", "MediCare Labs", "PrimeLife Diagnostics", "HealthFirst Centre", "Apollo Micro"];

const testimonials = [
  {
    quote: "QueueSmart cut our average patient wait from 50 minutes to under 15. The staff love it.",
    name: "Dr. Ananya Desai",
    role: "Founder, CityHealth Clinic",
  },
  {
    quote: "We saw a 40% drop in no-shows within the first month. Patients actually know when to arrive now.",
    name: "Rajesh Iyer",
    role: "Manager, MediCare Labs",
  },
  {
    quote: "Setup was effortless. Our reception team was trained in under an hour.",
    name: "Dr. Kavita Nair",
    role: "Director, PrimeLife Diagnostics",
  },
];

const TrustSection = () => (
  <SectionWrapper id="trust" className="space-y-14">
    <div className="text-center">
      <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Trusted by growing clinics</p>
    </div>

    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
      {logos.map((logo) => (
        <span
          key={logo}
          className="rounded-full border border-border/80 bg-white/70 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm"
        >
          {logo}
        </span>
      ))}
    </div>

    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((testimonial) => (
        <div key={testimonial.name} className="glass-panel rounded-[28px] p-6">
          <div className="flex gap-0.5 text-primary">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">"{testimonial.quote}"</p>
          <div className="mt-4">
            <p className="text-sm font-semibold">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default TrustSection;
