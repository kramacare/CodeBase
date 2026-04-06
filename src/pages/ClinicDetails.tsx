import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Star, Clock, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PatientTermsModal from "@/components/auth/PatientTermsModal";

interface Review {
  id: number;
  patient_name: string;
  rating: number;
  review_text: string;
  likes: number;
  dislikes: number;
  created_at: string;
}

const ClinicDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState<{text: string; type: "success" | "error"} | null>(null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [dates, setDates] = useState<any[]>([]);
  const [userReactions, setUserReactions] = useState<{[key: number]: string}>({});
  const [patientId, setPatientId] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showPatientTerms, setShowPatientTerms] = useState(false);

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
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:8000/auth/reviews/clinic?clinic_id=${id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
          setAverageRating(data.average_rating || 0);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    const fetchUserReactions = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr && id) {
        const user = JSON.parse(userStr);
        const pid = user.patient_id || user.id;
        setPatientId(pid);
        
        try {
          const response = await fetch(
            `http://localhost:8000/auth/reviews/user-reaction?clinic_id=${id}&patient_id=${pid}`
          );
          if (response.ok) {
            const data = await response.json();
            const reactions: {[key: number]: string} = {};
            Object.entries(data.reactions).forEach(([key, value]) => {
              reactions[parseInt(key)] = value as string;
            });
            setUserReactions(reactions);
          }
        } catch (error) {
          console.error("Error fetching user reactions:", error);
        }
      }
      setLoading(false);
    };

    fetchClinicData();
    fetchReviews();
    fetchUserReactions();
  }, [id]);

  const handleLike = async (reviewId: number) => {
    if (!patientId) return;
    
    try {
      const response = await fetch(
        `http://localhost:8000/auth/reviews/like?review_id=${reviewId}&patient_id=${patientId}`,
        { method: "POST" }
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(reviews.map(r => 
          r.id === reviewId ? { ...r, likes: data.likes, dislikes: data.dislikes } : r
        ));
        setUserReactions({ ...userReactions, [reviewId]: data.user_reaction });
      }
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  const handleDislike = async (reviewId: number) => {
    if (!patientId) return;
    
    try {
      const response = await fetch(
        `http://localhost:8000/auth/reviews/dislike?review_id=${reviewId}&patient_id=${patientId}`,
        { method: "POST" }
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(reviews.map(r => 
          r.id === reviewId ? { ...r, likes: data.likes, dislikes: data.dislikes } : r
        ));
        setUserReactions({ ...userReactions, [reviewId]: data.user_reaction });
      }
    } catch (error) {
      console.error("Error disliking review:", error);
    }
  };

  const fetchTimeSlots = async (date: string) => {
    try {
      const response = await fetch(`http://localhost:8000/auth/clinic/time-slots?clinic_id=${id}&date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data.slots || []);
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString("en-US", { weekday: "short" });
      const displayDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      dates.push({
        value: dateStr,
        label: dayName,
        display: displayDate
      });
    }
    
    return dates;
  };

  const handleBookClick = () => {
    if (!localStorage.getItem("user")) {
      setMessage({text: "Please login to book appointment", type: "error"});
      navigate("/patient/login");
      return;
    }
    
    // Generate dates for next 3 days
    const dateOptions = generateDates();
    setDates(dateOptions);
    
    // Default to tomorrow (index 1) instead of today (index 0)
    const defaultDate = dateOptions[1]?.value || dateOptions[0].value;
    setSelectedDate(defaultDate);
    fetchTimeSlots(defaultDate);
    setShowTimeSelection(true);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    fetchTimeSlots(date);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTime || !selectedDate) {
      setMessage({text: "Please select a date and time", type: "error"});
      return;
    }

    // Check if selected date is today to determine if modal should show
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedDate !== today) {
      // Show terms modal for future bookings
      setShowPatientTerms(true);
    } else {
      // Proceed directly for same-day bookings
      proceedWithBooking();
    }
  };

  const proceedWithBooking = async () => {
    if (!selectedTime || !selectedDate) {
      setMessage({text: "Please select a date and time", type: "error"});
      return;
    }

    setBooking(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);

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
        date: selectedDate,
        time: selectedTime
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
            date: selectedDate,
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
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            <div className="mt-4 flex h-36 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
              🗺️ Map placeholder - {clinic.address}
            </div>

            {/* Clinic Images Gallery - only show valid URLs */}
            {clinic.image_urls && clinic.image_urls.filter((url: string | null) => url !== null && url !== undefined).length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Clinic Photos</h2>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {clinic.image_urls.map((url: string | null, idx: number) => (
                    url ? (
                      <div 
                        key={idx} 
                        className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer"
                        onClick={() => setSelectedImageIndex(idx)}
                      >
                        <img 
                          src={`http://localhost:8000${url}`} 
                          alt={`Clinic photo ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-clinic.jpg';
                          }}
                        />
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}

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

            {/* Reviews Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Reviews ({reviews.length})
                </h2>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                </div>
              </div>
              
              {reviews.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No reviews yet. Be the first to review!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{review.patient_name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {review.review_text && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {review.review_text}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(review.id)}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            userReactions[review.id] === 'like'
                              ? 'text-blue-600 font-semibold'
                              : 'text-muted-foreground hover:text-blue-600'
                          }`}
                        >
                          <ThumbsUp className={`h-4 w-4 ${userReactions[review.id] === 'like' ? 'fill-current' : ''}`} />
                          <span>{review.likes || 0}</span>
                        </button>
                        <button
                          onClick={() => handleDislike(review.id)}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            userReactions[review.id] === 'dislike'
                              ? 'text-red-600 font-semibold'
                              : 'text-muted-foreground hover:text-red-600'
                          }`}
                        >
                          <ThumbsDown className={`h-4 w-4 ${userReactions[review.id] === 'dislike' ? 'fill-current' : ''}`} />
                          <span>{review.dislikes || 0}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Date Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {dates.map((date) => (
                <button
                  key={date.value}
                  onClick={() => handleDateChange(date.value)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    selectedDate === date.value
                      ? "bg-[#00555A] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {date.label}, {date.display}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.display)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      !slot.available
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : selectedTime === slot.display
                          ? "border-[#00555A] bg-[#00555A] text-white"
                          : "border-border bg-card hover:border-[#00555A]"
                    }`}
                  >
                    {slot.display}
                  </button>
                ))
              ) : (
                <p className="col-span-3 text-center text-muted-foreground">No time slots available</p>
              )}
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

      {/* Image Modal */}
      {selectedImageIndex !== null && clinic?.image_urls && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl w-full flex items-center justify-center">
            {/* Previous Button */}
            {selectedImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(selectedImageIndex - 1);
                }}
                className="absolute left-4 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
              >
                <ChevronLeft className="h-8 w-8 text-white" />
              </button>
            )}

            {/* Image */}
            <img
              src={`http://localhost:8000${clinic.image_urls[selectedImageIndex]}`}
              alt={`Clinic photo ${selectedImageIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next Button */}
            {selectedImageIndex < clinic.image_urls.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(selectedImageIndex + 1);
                }}
                className="absolute right-4 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 px-4 py-2 rounded-full text-white text-sm">
              {selectedImageIndex + 1} / {clinic.image_urls.length}
            </div>
          </div>
        </div>
      )}

      {/* Patient Terms Modal */}
      <PatientTermsModal
        open={showPatientTerms}
        onOpenChange={setShowPatientTerms}
        onAccept={() => {
          setShowPatientTerms(false);
          proceedWithBooking();
        }}
      />
    </div>
  );
};

export default ClinicDetails;
