import SectionWrapper from "./SectionWrapper";
import { Button } from "@/components/ui/button";
import { ClipboardList, PhoneCall, Settings } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Submit Onboarding Request",
    description: "Fill out a short form with your clinic details and requirements.",
  },
  {
    icon: PhoneCall,
    title: "We Verify & Connect",
    description: "Our team contacts you to understand your workflow and confirm details.",
  },
  {
    icon: Settings,
    title: "Setup + Training",
    description: "We configure QueueSmart for your clinic and provide hands-on training.",
  },
];

const OnboardingSteps = () => {
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <SectionWrapper id="onboarding" bgClassName="bg-primary/5">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          How Clinics Join <span className="text-primary">QueueSmart</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          We onboard clinics through a guided process to ensure quality deployment and support.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="relative flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <step.icon className="h-6 w-6" />
            </div>
            <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step {i + 1}
            </span>
            <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button size="lg" onClick={() => scrollTo("#cta")}>
          Request Clinic Onboarding
        </Button>
      </div>
    </SectionWrapper>
  );
};

export default OnboardingSteps;
