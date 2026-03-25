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

  // Fetch clinics from backend
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await fetch("http://localhost:8000/auth/clinics/list");
        if (response.ok) {
          const data = await response.json();
          setClinics(data.clinics);
        } else {
          console.error("Failed to fetch clinics");
        }
      } catch (error) {
        console.error("Error fetching clinics:", error);
      }
    };

    fetchClinics();
  }, []);

  const handleGPS = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setTimeout(() => {
            setLocationName("Indiranagar, Bangalore");
            setLocationGranted(true);
            setLocationLoading(false);
            setLoading(true);
            setTimeout(() => setLoading(false), 1200);
          }, 1500);
        },
        () => {
          setLocationName("Indiranagar, Bangalore");
          setLocationGranted(true);
          setLocationLoading(false);
          setLoading(true);
          setTimeout(() => setLoading(false), 1200);
        }
      );
    } else {
      setLocationName("Indiranagar, Bangalore");
      setLocationGranted(true);
      setLocationLoading(false);
    }
  };

  const handleManual = () => {
    setLocationName("Indiranagar, Bangalore");
    setLocationGranted(true);
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
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
