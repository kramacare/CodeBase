import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockClinics } from "@/data/mockData";
import type { Doctor } from "@/data/mockData";
import { ArrowLeft, CalendarDays, Check, Clock, MapPin, Phone, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import DoctorCard from "@/components/shared/DoctorCard";
import PatientTermsModal from "@/components/auth/PatientTermsModal";

interface ClinicTimeSlot {
  slot_name: string;
  time_range: number[];  // [start_hour, end_hour] e.g., [8, 11]
  is_open: boolean;
}

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

  // Steps: 0=Clinic Info, 1=Time Slots, 2=Doctor, 3=Date, 4=Confirm
  const [step, setStep] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<ClinicTimeSlot | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(preselectedDoc ?? null);
  const [selectedDate, setSelectedDate] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Time slots from backend
  const [timeSlots, setTimeSlots] = useState<ClinicTimeSlot[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const dates = useMemo(generateDates, []);

  // Fetch time slots when on step 1
  useEffect(() => {
    if (step === 1 && clinicId) {
      fetchTimeSlots();
    }
  }, [step, clinicId]);

  const fetchTimeSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await fetch(`http://localhost:8000/auth/clinic/time-slots?clinic_id=${clinicId}`);
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data.slots || []);
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  if (!clinic) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Clinic not found.</div>;

  const canNext = () => {
    if (step === 0) return true; // Just info display
    if (step === 1) return !!selectedTimeSlot;
    if (step === 2) return !!selectedDoctor;
    if (step === 3) return !!selectedDate;
    return true;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleConfirm = () => {
    navigate("/confirmation", {
      state: {
        clinic: clinic.name,
        doctor: selectedDoctor?.name,
        date: dates.find((d) => d.value === selectedDate)?.label,
        timeRange: selectedTimeSlot ? `${selectedTimeSlot.time_range[0]}:00 - ${selectedTimeSlot.time_range[1]}:00` : "",
        address: clinic.address,
        token: `T-${Math.floor(100 + Math.random() * 900)}`,
      },
    });
  };

  const proceedWithBooking = () => {
    handleConfirm();
  };

  const handleConfirmClick = () => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate !== today) {
      setShowTermsModal(true);
    } else {
      proceedWithBooking();
    }
  };

  const handleBook = async () => {
    // Create actual appointment
    try {
      const patientData = localStorage.getItem("patientData");
      const patient = patientData ? JSON.parse(patientData) : null;
      
      const response = await fetch("http://localhost:8000/auth/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: clinicId,
          doctor_id: selectedDoctor?.id,
          patient_id: patient?.id,
          patient_name: patient?.name,
          patient_email: patient?.email,
          patient_phone: patient?.phone,
          date: selectedDate,
          time_slot_index: selectedSlotIndex,
        }),
      });
      
      if (response.ok) {
        handleConfirm();
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
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
        {["Clinic", "Time Slot", "Doctor", "Date", "Confirm"].map((s, i) => (
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
        {/* Step 0 — Clinic Info */}
        {step === 0 && (
          <section className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{clinic.name}</h2>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{clinic.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{clinic.phone || "+91 98765 43210"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">About this clinic</h3>
              <p className="text-sm text-blue-800">
                Select your preferred time slot to see available doctors and book your appointment.
              </p>
            </div>
          </section>
        )}

        {/* Step 1 — Select Time Slot */}
        {step === 1 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select a Time Slot
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose when you'd like to visit.
            </p>
            
            {loadingSlots ? (
              <div className="text-center py-8 text-muted-foreground">Loading time slots...</div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-8 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground mb-2">No time slots available today.</p>
                <p className="text-sm text-muted-foreground">Please try again later or contact the clinic.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => { setSelectedTimeSlot(slot); setSelectedSlotIndex(index); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedSlotIndex === index
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <p className={`font-semibold ${selectedSlotIndex === index ? "text-primary" : "text-foreground"}`}>
                      {slot.slot_name} • {slot.time_range[0]}:00 - {slot.time_range[1]}:00
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Step 2 — Select Doctor */}
        {step === 2 && (
          <section className="space-y-3">
            <div className="bg-primary/5 rounded-lg p-3 mb-4">
              <p className="text-sm text-primary font-medium">
                Selected: {selectedTimeSlot && `${selectedTimeSlot.slot_name} ${selectedTimeSlot.time_range[0]}:00 - ${selectedTimeSlot.time_range[1]}:00`}
              </p>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Select a Doctor</h2>
            {clinic.doctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} selected={selectedDoctor?.id === doc.id} onBook={(d) => setSelectedDoctor(d)} />
            ))}
          </section>
        )}

        {/* Step 3 — Select Date */}
        {step === 3 && (
          <section>
            <div className="bg-primary/5 rounded-lg p-3 mb-4">
              <p className="text-sm text-primary font-medium">
                {selectedTimeSlot && `${selectedTimeSlot.slot_name} ${selectedTimeSlot.time_range[0]}:00 - ${selectedTimeSlot.time_range[1]}:00`} • {selectedDoctor?.name}
              </p>
            </div>
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

        {/* Step 4 — Confirm */}
        {step === 4 && (
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Confirm Your Appointment</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Clinic</dt><dd className="font-medium text-foreground">{clinic.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Doctor</dt><dd className="font-medium text-foreground">{selectedDoctor?.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Time</dt><dd className="font-medium text-foreground">{selectedTimeSlot && `${selectedTimeSlot.slot_name} ${selectedTimeSlot.time_range[0]}:00 - ${selectedTimeSlot.time_range[1]}:00`}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd className="font-medium text-foreground">{dates.find((d) => d.value === selectedDate)?.label}</dd></div>
            </dl>
            <p className="mt-4 rounded-lg bg-accent/10 px-4 py-2 text-sm text-accent">
              You will receive a live token on visit.
            </p>
          </section>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          {step === 4 ? (
            <>
              <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
              <Button className="flex-1" onClick={handleConfirmClick}>Confirm Appointment</Button>
            </>
          ) : (
            <Button className="ml-auto" disabled={!canNext()} onClick={() => setStep(step + 1)}>
              Next
            </Button>
          )}
        </div>
      </main>

      {/* Patient Terms Modal */}
      <PatientTermsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAccept={() => {
          setShowTermsModal(false);
          proceedWithBooking();
        }}
      />
    </div>
  );
};

export default BookAppointment;
