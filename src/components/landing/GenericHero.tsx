import { Button } from "@/components/ui/button";

const GenericHero = () => {
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="section-padding overflow-hidden">
      <div className="section-container">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Smarter Queue Management for Clinics.{" "}
            <span className="text-primary">Less Waiting for Patients.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground md:text-xl">
            QueueSmart helps clinics manage patient flow and lets patients avoid crowded waiting rooms with live token tracking.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => scrollTo("#role-select")}>
              I'm a Patient
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo("#role-select")}>
              I'm a Clinic
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenericHero;
