import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "@/components/shared/SearchBar";
import ClinicCard from "@/components/shared/ClinicCard";
import LocationAccessCard from "@/components/shared/LocationAccessCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import type { Clinic } from "@/data/mockData";

const medicalCategories: Record<
  string,
  { name: string; description: string; icon: string }
> = {
  all: {
    name: "All Categories",
    description: "Show all clinics and specializations",
    icon: "🏥",
  },
  general: {
    name: "General",
    description: "Fever, cold, and general health issues",
    icon: "🩺",
  },
  skin: {
    name: "Skin",
    description: "Skin problems, allergies, treatments",
    icon: "🔬",
  },
  dental: {
    name: "Dental",
    description: "Teeth cleaning, filling, extraction",
    icon: "🦷",
  },
  bone: {
    name: "Bone",
    description: "Bone fractures, joint pain treatment",
    icon: "🦴",
  },
  eye: {
    name: "Eye",
    description: "Vision check, glasses, eye problems",
    icon: "👁️",
  },
  ent: {
    name: "ENT",
    description: "Ear nose throat problems treatment",
    icon: "👂",
  },
  vet: {
    name: "Pet Hospital",
    description: "Pet treatment and grooming services",
    icon: "🐕",
  },
  scanning: {
    name: "Scanning Center",
    description: "X-ray, MRI, CT scan services",
    icon: "📷",
  },
};

const PatientFindClinics = () => {
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [message, setMessage] = useState<{text: string; type: "success" | "error"} | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch clinics from backend - only active ones with available slots
  useEffect(() => {
    const fetchClinics = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/auth/clinics/list");
        if (response.ok) {
          const data = await response.json();
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          const currentTimeMinutes = currentHour * 60 + currentMinute;
          
          // Filter and transform clinics
          const filteredClinics = [];
          
          for (const clinic of data.clinics) {
            // Only show clinics that are active
            if (!clinic.is_active) continue;
            
            // Fetch time slots for this clinic
            try {
              const slotsResponse = await fetch(`http://localhost:8000/auth/clinic/time-slots?clinic_id=${clinic.clinic_id}`);
              if (slotsResponse.ok) {
                const slotsData = await slotsResponse.json();
                const slots = slotsData.slots || [];
                
                // Check if clinic has any available slots
                const availableSlots = slots.filter((slot: any) => {
                  if (!slot.is_open) return false;
                  const endHour = slot.time_range[1];
                  const endTimeMinutes = endHour * 60;
                  const cutoffTime = endTimeMinutes - 15;
                  return currentTimeMinutes < cutoffTime;
                });
                
                if (availableSlots.length > 0) {
                  filteredClinics.push({
                    id: clinic.clinic_id,
                    name: clinic.clinic_name,
                    address: clinic.address,
                    phone: clinic.phone,
                    doctors: clinic.doctors || [{ name: clinic.doctor_name || "Available Doctor" }],
                    specializations: clinic.specializations || ["general"],
                    rating: clinic.rating || 4.5,
                    wait_time: clinic.wait_time || "15-30 min",
                    distance: clinic.distance || "2.5 km",
                    availableSlots: availableSlots
                  });
                }
              }
            } catch (e) {
              console.error("Error fetching slots for clinic:", clinic.clinic_id, e);
            }
          }
          
          setClinics(filteredClinics);
        } else {
          setMessage({text: "Failed to fetch clinics", type: "error"});
        }
      } catch (error) {
        setMessage({text: "Error fetching clinics", type: "error"});
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  const handleGPS = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use reverse geocoding to get actual location name
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            const locationString = data.city || data.locality || data.principalSubdivision || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            setLocationName(locationString);
          } catch (error) {
            // Fallback to coordinates if API fails
            setLocationName(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          }
          setLocationGranted(true);
          setLocationLoading(false);
          setLoading(true);
          setTimeout(() => setLoading(false), 1200);
        },
        async (error) => {
          console.error("Geolocation error:", error);
          // Try to get location anyway using a different method
          try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            setLocationName(data.city || data.region || data.country || "Location not found");
          } catch (e) {
            setLocationName("Location unavailable");
          }
          setLocationGranted(true);
          setLocationLoading(false);
          setLoading(true);
          setTimeout(() => setLoading(false), 1200);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationName("Geolocation not supported");
      setLocationGranted(true);
      setLocationLoading(false);
    }
  };

  const handleManual = () => {
    setMessage({text: "Please enter your location manually", type: "success"});
  };

  const filtered = clinics.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      c.doctors.some((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      ) ||
      c.specializations.some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" ||
      c.specializations.some((s) =>
        s.toLowerCase().includes(selectedCategory.toLowerCase())
      );

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link
            to="/patient"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <span className="font-semibold text-foreground">Find clinics</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">
          Find Clinics Near You
        </h1>
        <p className="mt-1 text-muted-foreground">
          Book appointments and skip the waiting room.
        </p>

        {!locationGranted ? (
          <div className="mt-10">
            <LocationAccessCard
              onUseGPS={handleGPS}
              onManual={handleManual}
              loading={locationLoading}
            />
          </div>
        ) : (
          <>
            <div className="mt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <SearchBar
                    value={search}
                    onChange={setSearch}
                    location={locationName}
                  />
                </div>
                <div className="sm:w-64">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="h-[42px] w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(medicalCategories).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#00555A]/20 bg-[#00555A]/10 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {medicalCategories[selectedCategory].icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#00555A]">
                      {medicalCategories[selectedCategory].name}
                    </h3>
                    <p className="mt-1 text-sm text-[#00555A]/80">
                      {medicalCategories[selectedCategory].description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-6 space-y-4" aria-label="Clinic list">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border p-5"
                  >
                    <Skeleton className="mb-3 h-5 w-48" />
                    <Skeleton className="mb-2 h-4 w-64" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((c) => <ClinicCard key={c.id} clinic={c} />)
              ) : (
                <p className="py-12 text-center text-muted-foreground">
                  No clinics found matching your search.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default PatientFindClinics;
