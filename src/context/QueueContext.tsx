import { createContext, useContext, useState } from "react";

type Patient = {
  token: string;
  name: string;
  source: "qr" | "desk" | "online";
};

type QueueContextType = {
  queue: Patient[];
  addPatient: (name: string, source: Patient["source"]) => void;
  nextPatient: () => void;
  skipPatient: () => void;
  currentToken: number;
  completedCount: number;
  skippedCount: number;
  totalToday: number;
  resetQueue: () => void;
};

const QueueContext = createContext<QueueContextType | null>(null);

export const useQueue = () => {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error("useQueue must be used inside QueueProvider");
  return ctx;
};

export const QueueProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentToken, setCurrentToken] = useState(12);

  const [queue, setQueue] = useState<Patient[]>([
    { token: "A-13", name: "Rahul", source: "desk" },
    { token: "A-14", name: "Priya", source: "online" },
    { token: "A-15", name: "Amit", source: "qr" },
  ]);

  const [completedCount, setCompletedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const totalToday = 25;

  const addPatient = (name: string, source: Patient["source"]) => {
    const lastTokenNumber = queue.length
      ? parseInt(queue[queue.length - 1].token.split("-")[1])
      : currentToken;

    const newToken = `A-${lastTokenNumber + 1}`;

    setQueue((prev) => [...prev, { token: newToken, name, source }]);
  };

  const nextPatient = () => {
    if (queue.length === 0) return;

    const next = queue[0];
    setCurrentToken(parseInt(next.token.split("-")[1]));
    setQueue(queue.slice(1));
    setCompletedCount((prev) => prev + 1);
  };

  const skipPatient = () => {
    if (queue.length === 0) return;

    const skipped = queue[0];
    const remaining = queue.slice(1);

    const insertPos = Math.min(3, remaining.length);
    remaining.splice(insertPos, 0, skipped);

    setQueue(remaining);
    setSkippedCount((prev) => prev + 1);
  };

  const resetQueue = () => {
    setQueue([]);
    setCurrentToken(1);
    setCompletedCount(0);
    setSkippedCount(0);
  };

  return (
    <QueueContext.Provider
      value={{
        queue,
        addPatient,
        nextPatient,
        skipPatient,
        currentToken,
        completedCount,
        skippedCount,
        totalToday,
        resetQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};
