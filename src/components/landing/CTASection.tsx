import SectionWrapper from "./SectionWrapper";
import { Button } from "@/components/ui/button";
import type { UserRole } from "./RoleToggle";

const ctaContent = {
  patient: {
    heading: <>Find your clinic and <span className="text-primary">skip the wait</span></>,
    sub: "Join thousands of patients already using QueueSmart for smarter, faster clinic visits.",
    primaryBtn: "Find Clinics Near Me",
    secondaryBtn: "Learn More",
  },
  clinic: {
    heading: <>Bring smart queue management to <span className="text-primary">your clinic</span></>,
    sub: "We onboard clinics based on requests to ensure quality deployment. Join our growing network of partner clinics.",
    primaryBtn: "Request Onboarding",
    secondaryBtn: "Book a Demo",
  },
};

const CTASection = ({ role = "patient" }: { role?: UserRole }) => {
  const c = ctaContent[role] ?? ctaContent.patient;

  return (
    <SectionWrapper id="cta" bgClassName="bg-primary/5">
      <div key={role} className="mx-auto max-w-2xl text-center animate-fade-in">
        <h2 className="font-display text-3xl font-bold md:text-4xl">{c.heading}</h2>
        <p className="mt-4 text-muted-foreground">{c.sub}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg">{c.primaryBtn}</Button>
          <Button size="lg" variant="outline">{c.secondaryBtn}</Button>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default CTASection;
