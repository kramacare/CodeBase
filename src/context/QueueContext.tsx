import { createContext, useContext, useState, useCallback } from "react";

type QueueItem = {
  token: string;
  name: string;
  patient_email?: string;
  source: "online" | "desk" | "skipped";
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
  historyId: number | null;
  patientName: string;
  token: string;
  position: number;
  startTime: Date | null;
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
  skipPatient: () => Promise<void>;
  fetchQueueStats: (clinicId: string) => void;
  fetchQueueForClinic: (clinicId: string) => void;
};

const QueueContext = createContext<QueueContextType | null>(null);

export const useQueue = () => {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error("useQueue must be used inside QueueProvider");
  return ctx;
};

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
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch appointments for this clinic today
      const response = await fetch(`http://localhost:8000/auth/appointments/today?clinic_id=${clinicId}`);
      if (response.ok) {
        const data = await response.json();
        const appointments = data.appointments || [];
        
        // Convert appointments to queue items
        const queueItems: QueueItem[] = appointments.map((apt: any, index: number) => ({
          token: apt.token || `T-${index + 1}`,
          name: apt.patient_name,
          patient_email: apt.patient_email,
          source: "online" as const,
          clinic_id: apt.clinic_id,
          appointment_id: apt.id
        }));
        
        setQueue(queueItems);
        setTotalToday(appointments.length);
        
        // Set current token to last served + 1
        if (appointments.length > 0) {
          const lastToken = appointments.length;
          setCurrentToken(lastToken);
        }
      }
      
      // Also fetch history stats for accurate completed/skipped counts
      const statsResponse = await fetch(`http://localhost:8000/auth/queue/history/stats?clinic_id=${clinicId}`);
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
      const response = await fetch(`http://localhost:8000/queue/stats/${clinicId}`);
      if (response.ok) {
        const data = await response.json();
        setQueueStats(data);
        setCurrentToken(data.currently_serving);
      }
    } catch (error) {
      console.error("Failed to fetch queue stats:", error);
    }
  }, []);

  const nextPatient = useCallback(async () => {
    if (queue.length > 0) {
      const patient = queue[0];
      const position = queue.length;
      const appointmentId = patient.appointment_id;
      
      // Step 1: If there's a current patient being served, end their session first
      if (currentServing && currentServing.historyId) {
        try {
          console.log("Ending session for previous patient:", currentServing.patientName);
          const endResponse = await fetch(`http://localhost:8000/auth/queue/history/${currentServing.historyId}/end`, {
            method: "PUT"
          });
          if (endResponse.ok) {
            const endData = await endResponse.json();
            console.log("Previous session ended:", endData);
          }
        } catch (error) {
          console.error("Failed to end previous patient session:", error);
        }
      }
      
      // Step 2: Start new patient session (record start_time)
      try {
        const patientEmail = patient.patient_email || "";
        const startResponse = await fetch(
          `http://localhost:8000/auth/queue/history/start?clinic_id=${patient.clinic_id}&patient_name=${encodeURIComponent(patient.name)}&patient_email=${encodeURIComponent(patientEmail)}&token=${patient.token}&position=${position}`,
          { method: "POST" }
        );
        
        if (startResponse.ok) {
          const historyData = await startResponse.json();
          console.log("New session started:", historyData);
          
          // Update current serving state
          setCurrentServing({
            historyId: historyData.history_id,
            patientName: patient.name,
            token: patient.token,
            position: position,
            startTime: new Date()
          });
        }
      } catch (error) {
        console.error("Failed to start patient session:", error);
      }
      
      // Step 3: Delete the appointment from appointments table
      if (appointmentId) {
        try {
          await fetch(`http://localhost:8000/auth/appointments/${appointmentId}`, {
            method: "DELETE"
          });
          console.log("Appointment deleted from table");
        } catch (error) {
          console.error("Failed to delete appointment:", error);
        }
      }
      
      // Step 4: Remove patient from queue and update counters
      const newQueue = queue.slice(1);
      setQueue(newQueue);
      setCurrentToken(prev => prev + 1);
      setCompletedCount(prev => prev + 1);
      setTotalToday(prev => prev - 1);
      
      // If queue is now empty, keep currentServing (will end on next Next click)
      // DO NOT clear currentServing here - wait for user to click Next again
    } else if (currentServing && currentServing.historyId) {
      // Queue is empty - this is the 4th click to end the last patient's session
      try {
        console.log("Queue empty, ending session for:", currentServing.patientName);
        const endResponse = await fetch(`http://localhost:8000/auth/queue/history/${currentServing.historyId}/end`, {
          method: "PUT"
        });
        if (endResponse.ok) {
          const endData = await endResponse.json();
          console.log("Final session ended:", endData);
        }
      } catch (error) {
        console.error("Failed to end patient session:", error);
      }
      setCurrentServing(null);
      setCurrentToken(prev => prev + 1);
    }
  }, [queue, currentServing]);

  const skipPatient = useCallback(async () => {
    if (queue.length > 0) {
      const patient = queue[0];
      
      // If there's a current patient being served, end their session first
      if (currentServing && currentServing.historyId) {
        try {
          await fetch(`http://localhost:8000/auth/queue/history/${currentServing.historyId}/end`, {
            method: "PUT"
          });
        } catch (error) {
          console.error("Failed to end previous patient session:", error);
        }
      }
      
      // Record skipped patient
      try {
        await fetch(
          `http://localhost:8000/auth/queue/history/start?clinic_id=${patient.clinic_id}&patient_name=${encodeURIComponent(patient.name)}&patient_email=&token=${patient.token}&position=${queue.length}`,
          { method: "POST" }
        );
      } catch (error) {
        console.error("Failed to record skipped patient:", error);
      }
      
      // Move skipped patient to position 3 (after 2 patients)
      // Queue: [A, B, C, D, E] -> Skip A -> [B, C, A, D, E]
      const skippedPatient = { ...patient, source: "skipped" as const };
      const remainingQueue = queue.slice(1);
      
      // Insert skipped patient at index 2 (position 3)
      const newQueue = [...remainingQueue.slice(0, 2), skippedPatient, ...remainingQueue.slice(2)];
      setQueue(newQueue);
      setCurrentToken(prev => prev + 1);
      setSkippedCount(prev => prev + 1);
      setCurrentServing(null);
    }
  }, [queue, currentServing]);

  const addPatient = useCallback((name: string, source: "online" | "desk") => {
    const newToken = `T-${totalToday + 1}`;
    const newPatient: QueueItem = {
      token: newToken,
      name,
      source,
      clinic_id: ""
    };
    setQueue(prev => [...prev, newPatient]);
    setTotalToday(prev => prev + 1);
  }, [totalToday]);

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
        skipPatient,
        addPatient,
        resetQueue,
        fetchQueueStats,
        fetchQueueForClinic
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};
