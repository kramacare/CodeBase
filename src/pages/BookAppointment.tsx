import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockClinics } from "@/data/mockData";
import type { Doctor } from "@/data/mockData";
import { ArrowLeft, CalendarDays, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import DoctorCard from "@/components/shared/DoctorCard";
import TimeSlotSelector from "@/components/shared/TimeSlotSelector";

const steps = ["Select Doctor", "Select Date", "Select Time", "Confirm"];

const generateDates = () => {
  const dates: { label: string; value: string; day: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    dates.push({
      label: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      value: d.toISOString().split("T")[0],
      day: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" }),
    });
  }
  return dates;
};

const BookAppointment = () => {
  const { clinicId, doctorId } = useParams<{ clinicId: string; doctorId: string }>();
  const navigate = useNavigate();
  const clinic = mockClinics.find((c) => c.id === clinicId);
  const preselectedDoc = clinic?.doctors.find((d) => d.id === doctorId);

  const [step, setStep] = useState(preselectedDoc ? 1 : 0);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(preselectedDoc ?? null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const dates = useMemo(generateDates, []);
  const slotObj = selectedDoctor?.slots.find((s) => s.id === selectedSlot);

  if (!clinic) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Clinic not found.</div>;

  const canNext = () => {
    if (step === 0) return !!selectedDoctor;
    if (step === 1) return !!selectedDate;
    if (step === 2) return !!selectedSlot;
    return true;
  };

  const handleConfirm = () => {
  navigate("/confirmation", {
    state: {
      clinic: clinic.name,
      doctor: selectedDoctor?.name,
      date: dates.find((d) => d.value === selectedDate)?.label,
      time: slotObj?.time,
      address: clinic.address,
      token: `T-${Math.floor(100 + Math.random() * 900)}`,
    },
  });
};



  const handleConfirmAppointment = async () => {
  console.log("CALLING BACKEND...");

  try {
    const res = await fetch("http://localhost:5050/api/tokens/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        doctorId: 1,
        clinicId: 1,
        categoryId: 1,
        patientName: "Online Patient",
        source: "ONLINE"
      })
    });

    const data = await res.json();

    console.log("TOKEN RESPONSE:", data);

    alert("Token created! Check console.");
  } catch (err) {
    console.error("API ERROR:", err);
  }
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <button onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))} className="text-muted-foreground hover:text-foreground" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold text-foreground">Book Appointment</span>
        </div>
      </header>

      {/* Step indicator */}
      <div className="mx-auto flex max-w-3xl items-center gap-1 px-4 py-4">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
              i < step ? "bg-accent text-accent-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="hidden text-[10px] text-muted-foreground sm:block">{s}</span>
          </div>
        ))}
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-12">
        {/* Step 0 — Doctor */}
        {step === 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Select a Doctor</h2>
            {clinic.doctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} selected={selectedDoctor?.id === doc.id} onBook={(d) => setSelectedDoctor(d)} />
            ))}
          </section>
        )}

        {/* Step 1 — Date */}
        {step === 1 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              <CalendarDays className="mr-1 inline h-5 w-5" /> Select Date
            </h2>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {dates.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDate(d.value)}
                  className={`rounded-lg border px-3 py-3 text-center text-sm font-medium transition-all ${
                    selectedDate === d.value
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary"
                  }`}
                >
                  <span className="block text-xs opacity-70">{d.day}</span>
                  {d.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 2 — Time */}
        {step === 2 && selectedDoctor && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              <Clock className="mr-1 inline h-5 w-5" /> Select Time Slot
            </h2>
            <TimeSlotSelector slots={selectedDoctor.slots} selected={selectedSlot} onSelect={setSelectedSlot} />
          </section>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Confirm Your Appointment</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Clinic</dt><dd className="font-medium text-foreground">{clinic.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Doctor</dt><dd className="font-medium text-foreground">{selectedDoctor?.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd className="font-medium text-foreground">{dates.find((d) => d.value === selectedDate)?.label}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Time</dt><dd className="font-medium text-foreground">{slotObj?.time}</dd></div>
            </dl>
            <p className="mt-4 rounded-lg bg-accent/10 px-4 py-2 text-sm text-accent">
              You will receive a live token on visit.
            </p>
          </section>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          {step === 3 ? (
            <>
              <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>

              <Button className="flex-1" onClick={handleConfirm}>Confirm Appointment</Button>

            </>
          ) : (
            <Button className="ml-auto" disabled={!canNext()} onClick={() => setStep(step + 1)}>
              Next
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookAppointment;
