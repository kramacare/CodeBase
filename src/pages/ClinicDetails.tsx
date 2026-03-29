import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const ClinicDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState<{text: string; type: "success" | "error"} | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/auth/clinic/data?clinic_id=${id}`);
        if (response.ok) {
          const data = await response.json();
          setClinic(data);
        } else {
          setMessage({text: "Failed to fetch clinic data", type: "error"});
        }
      } catch (error) {
        setMessage({text: "Network error. Please try again.", type: "error"});
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, [id]);

  const generateTimeSlots = () => {
    const times = [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
      "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM",
      "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
      "04:30 PM", "05:00 PM"
    ];
    return times;
  };

  const handleBookClick = () => {
    if (!localStorage.getItem("user")) {
      setMessage({text: "Please login to book appointment", type: "error"});
      navigate("/patient/login");
      return;
    }
    setShowTimeSelection(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTime) {
      setMessage({text: "Please select a time", type: "error"});
      return;
    }

    setBooking(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);
      const today = new Date().toISOString().split('T')[0];

      const clinicId = clinic.clinic_id || id;
      
      // If patient_id is missing, fetch from patient data
      let patientId = user.patient_id;
      let patientPhone = user.phone;
      
      if (!patientId || !patientPhone) {
        try {
          const patientDataResponse = await fetch(`http://localhost:8000/auth/patient/data?email=${user.email}`);
          if (patientDataResponse.ok) {
            const patientData = await patientDataResponse.json();
            patientId = patientData.patient_id;
            patientPhone = patientData.phone;
          }
        } catch (e) {
          console.error("Failed to fetch patient data:", e);
        }
      }

      const requestData = {
        patient_id: patientId || "P-GUEST",
        patient_name: user.name || user.email?.split('@')[0] || "Patient",
        patient_email: user.email || "",
        patient_phone: patientPhone || "",
        clinic_id: clinicId,
        doctor_name: clinic.doctor_name || "General",
        date: today,
        time: selectedTime || "10:00"
      };

      const response = await fetch("http://localhost:8000/auth/appointments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/confirmation", {
          state: {
            clinic: clinic.clinic_name,
            doctor: clinic.doctor_name || "Available Doctor",
            date: today,
            time: selectedTime,
            address: clinic.address,
            token: data.token,
            patient_name: requestData.patient_name,
            patient_phone: requestData.patient_phone,
            patient_email: requestData.patient_email
          }
        });
      } else {
        setMessage({text: `Failed to book: ${data.detail || JSON.stringify(data)}`, type: "error"});
      }
    } catch (error) {
      setMessage({text: "Failed to book appointment. Please try again.", type: "error"});
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Clinic not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <button
            onClick={() => showTimeSelection ? setShowTimeSelection(false) : navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold text-foreground">
            {showTimeSelection ? "Select Time" : clinic.clinic_name}
          </span>
        </div>
      </header>

      {/* Message Toast */}
      {message && (
        <div className={`fixed top-16 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-fade-in ${
          message.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {message.text}
        </div>
      )}

      <main className="mx-auto max-w-3xl px-4 py-8">
        {!showTimeSelection ? (
          /* Clinic Info View */
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground">{clinic.clinic_name}</h1>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {clinic.address}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {clinic.phone}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                4.5 (150 reviews)
              </span>
            </div>

            <div className="mt-4 flex h-36 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
              🗺️ Map placeholder - {clinic.address}
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-foreground">Doctor</h2>
              <div className="mt-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-lg">👨‍⚕️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{clinic.doctor_name || "Available Doctor"}</h3>
                    <p className="text-sm text-muted-foreground">General Practice</p>
                    <p className="text-xs text-green-600">Available Today</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handleBookClick}
                    className="w-full bg-[#00555A] hover:bg-[#004455] text-white"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Time Selection View */
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Select Appointment Time</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold text-foreground">{clinic.clinic_name}</h3>
              <p className="text-sm text-muted-foreground">{clinic.doctor_name || "Available Doctor"}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {generateTimeSlots().map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-lg border text-sm transition-colors ${
                    selectedTime === time
                      ? "border-[#00555A] bg-[#00555A] text-white"
                      : "border-border bg-card hover:border-[#00555A]"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <Button
                onClick={handleConfirmBooking}
                disabled={!selectedTime || booking}
                className="w-full bg-[#00555A] hover:bg-[#004455] text-white disabled:opacity-50"
              >
                {booking ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClinicDetails;
