import { createContext, useContext, useState, useEffect } from "react";

type QueueStats = {
  total_waiting: number;
  currently_serving: number;
  completed_today: number;
  average_wait_time: string | null;
};

type QueueContextType = {
  currentToken: number;
  queueStats: QueueStats | null;
  fetchQueueStats: (clinicId: string) => void;
};

const QueueContext = createContext<QueueContextType | null>(null);

export const useQueue = () => {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error("useQueue must be used inside QueueProvider");
  return ctx;
};

export const QueueProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentToken, setCurrentToken] = useState(0);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);

  const fetchQueueStats = async (clinicId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/queue/stats/${clinicId}`);
      if (response.ok) {
        const data = await response.json();
        setQueueStats(data);
        // Set current token based on serving count
        setCurrentToken(data.currently_serving);
      }
    } catch (error) {
      console.error("Failed to fetch queue stats:", error);
    }
  };

  return (
    <QueueContext.Provider
      value={{
        currentToken,
        queueStats,
        fetchQueueStats,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};
