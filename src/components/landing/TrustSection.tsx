import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

const logos = ["CityHealth Clinic", "MediCare Labs", "PrimeLife Diagnostics", "HealthFirst Centre", "Apollo Micro"];

// Commented out testimonials data for potential future use
/*
const testimonials = [
  {
    quote: "QueueSmart cut our average patient wait from 50 minutes to under 15. The staff love it.",
    name: "Dr. Ananya Desai",
    role: "Founder, CityHealth Clinic",
    rating: 5,
    avatar: "AD"
  },
  {
    quote: "We saw a 40% drop in no-shows within the first month. Patients actually know when to arrive now.",
    name: "Rajesh Iyer",
    role: "Manager, MediCare Labs",
    rating: 5,
    avatar: "RI"
  },
  {
    quote: "Setup was effortless. Our reception team was trained in under an hour.",
    name: "Dr. Kavita Nair",
    role: "Director, PrimeLife Diagnostics",
    rating: 5,
    avatar: "KN"
  },
  {
    quote: "The real-time queue tracking has transformed our patient flow. It's like having an extra receptionist.",
    name: "Dr. Michael Chen",
    role: "Head, HealthFirst Centre",
    rating: 5,
    avatar: "MC"
  },
  {
    quote: "Patients love the transparency. They can see their turn from anywhere and plan accordingly.",
    name: "Sarah Johnson",
    role: "Operations Lead, Apollo Micro",
    rating: 5,
    avatar: "SJ"
  },
];
*/

// Commented out StarRating component for potential future use
/*
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <Star 
            className={`h-4 w-4 ${
              index < rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`} 
          />
        </motion.div>
      ))}
    </div>
  );
};
*/

const TrustSection = () => {
  return (
    <SectionWrapper id="trust" className="space-y-16">
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-sm uppercase tracking-[0.28em] text-muted-foreground"
        >
          Trusted by growing clinics
        </motion.p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
        {logos.map((logo, index) => (
          <motion.span
            key={logo}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            className="rounded-full border border-border/80 bg-white/70 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            {logo}
          </motion.span>
        ))}
      </div>

      {/* Additional Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>500+ Happy Clinics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>50,000+ Patients Served</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            <span>4.9/5 Average Rating</span>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

export default TrustSection;
