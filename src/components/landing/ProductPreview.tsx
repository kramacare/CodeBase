import SectionWrapper from "./SectionWrapper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SkipForward, ArrowRight } from "lucide-react";

const tokens = [
  { id: "B-12", name: "Rahul Sharma", status: "serving" },
  { id: "B-13", name: "Priya Patel", status: "waiting" },
  { id: "B-14", name: "Amit Kumar", status: "waiting" },
  { id: "B-15", name: "Sneha Rao", status: "waiting" },
  { id: "B-16", name: "Vikram Singh", status: "waiting" },
];

const ProductPreview = () => (
  <SectionWrapper id="preview" bgClassName="bg-secondary/50">
    <div className="text-center">
      <h2 className="font-display text-3xl font-bold md:text-4xl">Clinic <span className="text-primary">Dashboard</span></h2>
      <p className="mt-3 text-muted-foreground">A quick look at how staff manage the queue.</p>
    </div>
    <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="border-b border-border bg-secondary/60 px-5 py-3">
        <Tabs defaultValue="dr-mehta">
          <TabsList>
            <TabsTrigger value="dr-mehta">Dr. Mehta</TabsTrigger>
            <TabsTrigger value="dr-kapoor">Dr. Kapoor</TabsTrigger>
          </TabsList>
          <TabsContent value="dr-mehta" />
          <TabsContent value="dr-kapoor" />
        </Tabs>
      </div>
      <div className="divide-y divide-border">
        {tokens.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-5 py-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-primary">{t.id}</span>
              <span>{t.name}</span>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              t.status === "serving"
                ? "bg-accent/15 text-accent"
                : "bg-secondary text-muted-foreground"
            }`}>
              {t.status === "serving" ? "Serving" : "Waiting"}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 border-t border-border px-5 py-4">
        <Button size="sm" className="gap-1.5">
          <ArrowRight className="h-4 w-4" /> Next
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5">
          <SkipForward className="h-4 w-4" /> Skip
        </Button>
      </div>
    </div>
  </SectionWrapper>
);

export default ProductPreview;
