import { createContext, useContext, useState, useCallback } from "react";

type QueueItem = {
  token: string;
  name: string;
  phone?: string;
  patient_email?: string;
  source: "online" | "desk" | "walkin" | "skipped";
  clinic_id: string;
  appointment_id?: number;
};

type QueueStats = {
  total_waiting: number;
  currently_serving: number;
  completed_today: number;
  average_wait_time: string | null;
};

type CurrentServing = {
  patientName: string;
  token: string;
  position: number;
  startTime: Date | null;
  appointmentId?: number;
  clinicId?: string;
  source?: "online" | "desk" | "walkin" | "skipped";
};

type WalkinPayload = {
  clinic_id: string;
  doctor_id: string;
  patient_name: string;
  phone: string;
};

type WalkinResult = {
  token_number: number;
  token_label: string;
  position: number;
};

type QueueContextType = {
  queue: QueueItem[];
  currentToken: number;
  queueStats: QueueStats | null;
  completedCount: number;
  skippedCount: number;
  totalToday: number;
  currentServing: CurrentServing | null;
  nextPatient: () => Promise<void>;
  completePatient: () => Promise<void>;
  skipPatient: () => Promise<void>;
  fetchQueueStats: (clinicId: string) => void;
  fetchQueueForClinic: (clinicId: string) => void;
  addWalkinToQueue: (payload: WalkinPayload) => Promise<WalkinResult>;
  addPatient: (name: string, source: "online" | "desk") => void;
  resetQueue: () => void;
};

const QueueContext = createContext<QueueContextType | null>(null);

export const useQueue = () => {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error("useQueue must be used inside QueueProvider");
  return ctx;
};

const API_BASE = "http://localhost:8000";

export const QueueProvider = ({ children }: { children: React.ReactNode }) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentToken, setCurrentToken] = useState(0);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [currentServing, setCurrentServing] = useState<CurrentServing | null>(null);

  const fetchQueueForClinic = useCallback(async (clinicId: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/appointments/today?clinic_id=${clinicId}`);
      if (response.ok) {
        const data = await response.json();
        const appointments = data.appointments || [];
        const servingAppointment = appointments.find((apt: any) => apt.status === "serving");
        const waitingAppointments = appointments.filter((apt: any) => apt.status !== "serving");

        const queueItems: QueueItem[] = waitingAppointments.map((apt: any, index: number) => ({
          token: apt.token || `T-${index + 1}`,
          name: apt.patient_name,
          phone: apt.patient_phone,
          patient_email: apt.patient_email,
          source: apt.source === "walkin" ? "walkin" : "online",
          clinic_id: apt.clinic_id,
          appointment_id: apt.id,
        }));

        setQueue(queueItems);
        setTotalToday(appointments.length);
        
        // Preserve existing startTime if already set (when clicking Next)
        const existingStartTime = currentServing?.startTime;
        
        if (servingAppointment) {
          setCurrentServing({
            patientName: servingAppointment.patient_name,
            token: servingAppointment.token,
            position: 1,
            // Use existing startTime if set, otherwise use created_at
            startTime: existingStartTime || (servingAppointment.created_at ? new Date(servingAppointment.created_at) : null),
            appointmentId: servingAppointment.id,
            clinicId: servingAppointment.clinic_id,
            source: servingAppointment.source === "walkin" ? "walkin" : "online",
          });
        } else {
          setCurrentServing(null);
        }

        setCurrentToken(
          servingAppointment?.token
            ? Number.parseInt(String(servingAppointment.token).replace(/[^\d]/g, ""), 10) || 0
            : 0
        );
      }

      const statsResponse = await fetch(`${API_BASE}/auth/queue/history/stats?clinic_id=${clinicId}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setCompletedCount(statsData.total_patients_served || 0);
        setSkippedCount(statsData.total_skipped || 0);
      }
    } catch (error) {
      console.error("Failed to fetch queue:", error);
    }
  }, []);

  const fetchQueueStats = useCallback(async (clinicId: string) => {
    try {
      const response = await fetch(`${API_BASE}/queue/stats/${clinicId}`);
      if (response.ok) {
        const data = await response.json();
        setQueueStats(data);
        setCurrentToken(data.currently_serving);
      }
    } catch (error) {
      console.error("Failed to fetch queue stats:", error);
    }
  }, []);

  const addWalkinToQueue = useCallback(
    async (payload: WalkinPayload): Promise<WalkinResult> => {
      const res = await fetch(`${API_BASE}/queue/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: payload.clinic_id,
          doctor_id: payload.doctor_id,
          patient_name: payload.patient_name,
          phone: payload.phone,
          source: "walkin",
          booking_id: null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to join queue");
      }

      const data = await res.json();

      const newItem: QueueItem = {
        token: data.token_label || `W-${data.token_number}`,
        name: payload.patient_name,
        phone: payload.phone,
        source: "walkin",
        clinic_id: payload.clinic_id,
      };

      setQueue((prev) => [...prev, newItem]);
      setTotalToday((prev) => prev + 1);

      return {
        token_number: data.token_number,
        token_label: data.token_label || `W-${data.token_number}`,
        position: data.position,
      };
    },
    []
  );

  const nextPatient = useCallback(async () => {
    if (queue.length > 0) {
      const patient = queue[0];
      try {
        const response = await fetch(`${API_BASE}/auth/clinic/serve-patient`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinic_id: patient.clinic_id,
            appointment_id: patient.appointment_id,
            source: patient.source,
          }),
        });

        if (response.ok) {
          // Set start time to now when starting to serve - before fetch
          const startTimeNow = new Date();
          setCurrentServing(prev => prev ? { 
            ...prev, 
            startTime: startTimeNow,
            patientName: patient.name,
            token: patient.token,
            appointmentId: patient.appointment_id,
            clinicId: patient.clinic_id,
          } : null);
          
          // Remove from queue
          setQueue(prev => prev.slice(1));
          
          // Refresh after a short delay to let timer start
          setTimeout(() => {
            fetchQueueForClinic(patient.clinic_id);
          }, 500);
        }
      } catch (error) {
        console.error("Error serving patient:", error);
      }
    }
  }, [queue, fetchQueueForClinic]);

  const completePatient = useCallback(async () => {
    if (currentServing && currentServing.appointmentId) {
      try {
        const response = await fetch(`${API_BASE}/auth/clinic/finish-patient`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinic_id: currentServing.clinicId,
            appointment_id: currentServing.appointmentId,
            source: currentServing.source || "online"
          })
        });
        
        if (response.ok) {
          await fetchQueueForClinic(currentServing.clinicId || "");
        }
      } catch (error) {
        console.error("Error completing patient:", error);
      }
    }
  }, [currentServing, fetchQueueForClinic]);

  const skipPatient = useCallback(async () => {
    if (queue.length > 0) {
      const patient = queue[0];
      try {
        const response = await fetch(`${API_BASE}/auth/clinic/skip-patient`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinic_id: patient.clinic_id,
            appointment_id: patient.appointment_id,
            source: patient.source,
          }),
        });

        if (response.ok) {
          await fetchQueueForClinic(patient.clinic_id);
        }
      } catch (error) {
        console.error("Error skipping patient:", error);
      }
    }
  }, [queue, fetchQueueForClinic]);

  const addPatient = useCallback(
    (name: string, source: "online" | "desk") => {
      const newToken = `T-${totalToday + 1}`;
      const newPatient: QueueItem = {
        token: newToken,
        name,
        source,
        clinic_id: "",
      };
      setQueue((prev) => [...prev, newPatient]);
      setTotalToday((prev) => prev + 1);
    },
    [totalToday]
  );

  const resetQueue = useCallback(() => {
    setQueue([]);
    setCurrentToken(0);
    setCompletedCount(0);
    setSkippedCount(0);
    setTotalToday(0);
    setCurrentServing(null);
  }, []);

  return (
    <QueueContext.Provider
      value={{
        queue,
        currentToken,
        queueStats,
        completedCount,
        skippedCount,
        totalToday,
        currentServing,
        nextPatient,
        completePatient,
        skipPatient,
        addWalkinToQueue,
        fetchQueueStats,
        fetchQueueForClinic,
        addPatient,
        resetQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};
