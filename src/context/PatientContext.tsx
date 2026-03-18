import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ActiveAppointment = {
  token: string;
  clinic: string;
  doctor: string;
  date: string;
  time: string;
  address: string;
  status: "waiting" | "with_doctor" | "completed";
  estimatedWaitMins?: number;
  patientsAhead?: number;
};

export type VisitEntry = {
  id: string;
  clinicId: string;
  clinicName: string;
  date: string;
  hasReviewed: boolean;
  review?: string;
  rating?: number;
};

export type PatientProfile = {
  name: string;
  email: string;
  phone: string;
};

const STORAGE_KEYS = {
  profile: "krama_patient_profile",
  activeAppointment: "krama_active_appointment",
  visitHistory: "krama_visit_history",
};

const defaultProfile: PatientProfile = {
  name: "Patient",
  email: "patient@example.com",
  phone: "+91 98765 43210",
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    if (!s) return fallback;
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

type PatientContextType = {
  profile: PatientProfile;
  activeAppointment: ActiveAppointment | null;
  visitHistory: VisitEntry[];
  updatePhone: (phone: string) => void;
  updatePassword: (newPassword: string) => void;
  setActiveAppointment: (a: ActiveAppointment | null) => void;
  addVisit: (entry: Omit<VisitEntry, "id" | "hasReviewed">) => void;
  markReviewed: (visitId: string, review: string, rating: number) => void;
  clearActiveAppointment: () => void;
};

const PatientContext = createContext<PatientContextType | null>(null);

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatient must be used within PatientProvider");
  return ctx;
}

export function PatientProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PatientProfile>(
    () => loadJson(STORAGE_KEYS.profile, defaultProfile)
  );
  // Mock active appointment for demo
  const mockActiveAppointment: ActiveAppointment = {
    token: "A-17",
    clinic: "CityCare Clinic",
    doctor: "Dr. Ananya Sharma",
    date: "Feb 19, 2026",
    time: "11:00 AM",
    address: "42 MG Road, Indiranagar, Bangalore",
    status: "waiting",
    estimatedWaitMins: 20,
    patientsAhead: 4,
  };

  const [activeAppointment, setActiveAppointmentState] = useState<ActiveAppointment | null>(() => {
    const saved = loadJson<ActiveAppointment | null>(STORAGE_KEYS.activeAppointment, null);
    // If no saved appointment, use mock data for demo
    return saved || mockActiveAppointment;
  });
  // Mock visit history for demo - 2 clinics they've visited
  const mockVisitHistory: VisitEntry[] = [
    {
      id: "v-mock-1",
      clinicId: "clinic-1",
      clinicName: "CityCare Clinic",
      date: "Feb 15, 2026 at 10:30 AM",
      hasReviewed: false,
    },
    {
      id: "v-mock-2",
      clinicId: "clinic-2",
      clinicName: "MediHealth Center",
      date: "Feb 10, 2026 at 02:00 PM",
      hasReviewed: false,
    },
  ];

  const [visitHistory, setVisitHistory] = useState<VisitEntry[]>(() => {
    const saved = loadJson<VisitEntry[]>(STORAGE_KEYS.visitHistory, []);
    // If no saved visits, use mock data for demo
    return saved.length > 0 ? saved : mockVisitHistory;
  });

  const setActiveAppointment = useCallback((a: ActiveAppointment | null) => {
    setActiveAppointmentState(a);
    saveJson(STORAGE_KEYS.activeAppointment, a);
  }, []);

  const updatePhone = useCallback((phone: string) => {
    setProfile((p) => {
      const next = { ...p, phone };
      saveJson(STORAGE_KEYS.profile, next);
      return next;
    });
  }, []);

  const updatePassword = useCallback((_newPassword: string) => {
    // In a real app you'd call API. For now just persist that we "updated"
    saveJson(STORAGE_KEYS.profile, profile);
  }, [profile]);

  const addVisit = useCallback(
    (entry: Omit<VisitEntry, "id" | "hasReviewed">) => {
      const id = `v-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newEntry: VisitEntry = { ...entry, id, hasReviewed: false };
      setVisitHistory((prev) => {
        const next = [newEntry, ...prev];
        saveJson(STORAGE_KEYS.visitHistory, next);
        return next;
      });
    },
    []
  );

  const markReviewed = useCallback((visitId: string, review: string, rating: number) => {
    setVisitHistory((prev) => {
      const next = prev.map((v) =>
        v.id === visitId ? { ...v, hasReviewed: true, review, rating } : v
      );
      saveJson(STORAGE_KEYS.visitHistory, next);
      return next;
    });
  }, []);

  const clearActiveAppointment = useCallback(() => {
    setActiveAppointmentState(null);
    saveJson(STORAGE_KEYS.activeAppointment, null);
  }, []);

  return (
    <PatientContext.Provider
      value={{
        profile,
        activeAppointment,
        visitHistory,
        updatePhone,
        updatePassword,
        setActiveAppointment,
        addVisit,
        markReviewed,
        clearActiveAppointment,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}
