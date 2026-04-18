import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueue } from "@/context/QueueContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, SkipForward, ArrowRightCircle, RefreshCw, Clock, QrCode, Calendar } from "lucide-react";

interface TimeSlot {
  slot_name: string;
  time_range: number[];
  is_open: boolean;
}

const SourceBadge = ({ source }: { source: string }) => {
  const map: Record<string, { label: string; className: string }> = {
    walkin:  { label: "Walk-in",  className: "bg-[#FFC107]/20 text-[#7A5800]" },
    online:  { label: "Online",   className: "bg-[#00555A]/10 text-[#00555A]" },
    desk:    { label: "Desk",     className: "bg-gray-100 text-gray-600" },
  };
  const style = map[source] ?? map.desk;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${style.className}`}>
      {source === "walkin" && <QrCode className="h-3 w-3" />}
      {style.label}
    </span>
  );
};

const ClinicControlQueue = () => {
  const {
    queue,
    nextPatient,
    completePatient,
    skipPatient,
    currentToken,
    completedCount,
    totalToday,
    currentServing,
    fetchQueueForClinic,
  } = useQueue();

  const [clinicId, setClinicId] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isClinicActive, setIsClinicActive] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const clinicStr = localStorage.getItem("clinic_id");
    if (clinicStr) {
      setClinicId(clinicStr);
      fetchQueueForClinic(clinicStr);
    }
  }, [fetchQueueForClinic]);

  useEffect(() => {
    if (currentServing?.startTime) {
      const interval = setInterval(() => {
        const diff = Math.floor(
          (new Date().getTime() - new Date(currentServing.startTime!).getTime()) / 1000
        );
        setElapsedTime(diff);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [currentServing]);

  const handleRefreshQueue = () => {
    if (
      window.confirm(
        "Refresh the queue? This will reload today's data from the server."
      )
    ) {
      if (clinicId) fetchQueueForClinic(clinicId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const walkinCount = queue.filter((p) => p.source === "walkin").length;

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (clinicId) {
      fetchTimeSlots();
    }
  }, [clinicId]);

  const fetchTimeSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await fetch(`http://localhost:8000/auth/clinic/time-slots?clinic_id=${clinicId}`);
      if (response.ok) {
        const data = await response.json();
        const slots = data.slots || [];
        setTimeSlots(slots);
        
        // Auto-logout: check if current time is past 15 min before last slot ends
        if (isClinicActive && slots.length > 0) {
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          
          // Find the latest end time from open slots
          let latestEndMinutes = 0;
          for (const slot of slots) {
            if (slot.is_open) {
              const endMinutes = slot.time_range[1] * 60;
              if (endMinutes > latestEndMinutes) {
                latestEndMinutes = endMinutes;
              }
            }
          }
          
          // If current time is past (end - 15min), auto deactivate
          const cutoffMinutes = latestEndMinutes - 15;
          if (currentMinutes >= cutoffMinutes && latestEndMinutes > 0) {
            handleDeactivate();
          }
        }
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (clinicId) {
      fetch(`http://localhost:8000/auth/clinic/active-status?clinic_id=${clinicId}`)
        .then(res => res.json())
        .then(data => setIsClinicActive(data.is_active || false))
        .catch(console.error);
    }
  }, [clinicId]);

  const handleActivate = async () => {
    setActivating(true);
    try {
      const response = await fetch("http://localhost:8000/auth/clinic/set-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic_id: clinicId, is_active: true })
      });
      if (response.ok) {
        setIsClinicActive(true);
      }
    } catch (error) {
      console.error("Error activating clinic:", error);
    } finally {
      setActivating(false);
    }
  };

  const handleDeactivate = async () => {
    setActivating(true);
    try {
      const response = await fetch("http://localhost:8000/auth/clinic/set-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic_id: clinicId, is_active: false })
      });
      if (response.ok) {
        setIsClinicActive(false);
      }
    } catch (error) {
      console.error("Error deactivating clinic:", error);
    } finally {
      setActivating(false);
    }
  };

  const totalTodayReal = completedCount + queue.length + (currentServing ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link to="/clinic" className="text-muted-foreground hover:text-foreground" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-semibold text-foreground">Control Queue</span>
          <Button
            variant="outline"
            className="ml-auto border-gray-300 text-[#0F172A] hover:bg-gray-50 rounded-lg px-3 py-1.5 transition-all duration-200"
            onClick={handleRefreshQueue}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-[#0F172A] mb-6">Clinic Queue Control</h1>

          <div className={`rounded-xl p-4 mb-6 flex items-center justify-between ${
            isClinicActive 
              ? "bg-green-50 border border-green-300" 
              : "bg-gray-50 border border-gray-200"
          }`}>
            <div className="flex items-center gap-3">
              {isClinicActive && (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
              <span className={isClinicActive ? "text-green-800 font-medium" : "text-gray-600"}>
                {isClinicActive ? "Clinic is Live" : "Clinic is Offline"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleActivate}
                disabled={activating || isClinicActive}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Start
              </Button>
              <Button
                onClick={handleDeactivate}
                disabled={activating || !isClinicActive}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Stop
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-[#00555A]" />
              <h2 className="font-semibold text-[#0F172A]">Today's Time Slots</h2>
            </div>
            
            {loadingSlots ? (
              <div className="text-center py-4 text-gray-500">Loading slots...</div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No time slots configured.</p>
                <Link to="/clinic/manage-time" className="text-[#00555A] text-sm underline mt-1 inline-block">
                  Set up time slots
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${
                      slot.is_open ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium text-[#0F172A] text-sm">{slot.slot_name}</h3>
                    <p className="text-xs text-gray-600">
                      {slot.time_range[0]}:00 - {slot.time_range[1]}:00
                      {slot.is_open ? ' (Open)' : ' (Closed)'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">In Queue</p>
              <p className="text-2xl font-bold text-[#0F172A]">{queue.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-[#FFC107]">{completedCount}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Now Serving</p>
              <p className="text-2xl font-bold text-[#00555A]">{currentServing ? 1 : 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 text-center mb-6">
            {currentServing ? (
              <>
                <p className="text-sm text-gray-600 mb-2">Now Serving</p>
                <div className="text-5xl font-extrabold text-[#0F172A]">{currentServing.token}</div>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <p className="font-medium text-[#0F172A]">
                      {currentServing.patientName}
                    </p>
                    <SourceBadge source={
                      queue.find((q) => q.token === currentServing.token)?.source || "online"
                    } />
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Elapsed: {formatTime(elapsedTime)}</span>
                  </div>
                </div>
              </>
            ) : queue.length > 0 ? (
              <>
                <p className="text-sm text-[#00555A] mb-2 font-medium">Next to Serve</p>
                <div className="text-5xl font-extrabold text-[#0F172A]">{queue[0].token}</div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <p className="font-medium text-[#0F172A]">
                      {queue[0].name}
                    </p>
                    <SourceBadge source={queue[0].source} />
                  </div>
                  {queue[0].phone && (
                    <p className="text-xs text-gray-500 mt-1">{queue[0].phone}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-2">Now Serving</p>
                <div className="text-5xl font-extrabold text-gray-400">--</div>
                <p className="mt-4 text-gray-500">No patients in queue</p>
              </>
            )}
          </div>

          <div className="flex gap-4 mb-6">
            <Button
              className={`flex-1 hover:opacity-90 rounded-xl transition-all duration-200 ${
                currentServing 
                  ? "bg-[#FFC107] text-[#0F172A]" 
                  : "bg-[#00555A] text-white"
              }`}
              onClick={() => currentServing ? completePatient() : nextPatient()}
              disabled={!currentServing && queue.length === 0}
            >
              <ArrowRightCircle className="mr-2" size={18} />
              {currentServing ? "Completed" : "Next"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-[#0F172A] hover:bg-gray-50 rounded-xl transition-all duration-200"
              onClick={() => skipPatient()}
            >
              <SkipForward className="mr-2" size={18} />
              Skip
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-[#0F172A]" />
              <h2 className="font-semibold text-[#0F172A]">Waiting Queue</h2>
              {walkinCount > 0 && (
                <span className="ml-auto flex items-center gap-1 text-xs text-[#7A5800]">
                  <QrCode className="h-3 w-3" />
                  {walkinCount} QR walk-in{walkinCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {queue.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No patients in queue</p>
            ) : (
              queue.map((p, i) => (
                <div
                  key={p.token}
                  className={`flex justify-between items-center rounded-lg px-4 py-3 mb-2 last:mb-0 ${
                    p.source === "walkin"
                      ? "bg-[#FFC107]/10 border border-[#FFC107]/30"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-[#0F172A]">
                        {p.token} - {p.name}
                      </p>
                      {p.source === "walkin" ? (
                        p.phone && (
                          <p className="text-xs text-gray-500">{p.phone}</p>
                        )
                      ) : (
                        <>
                          {p.phone && (
                            <p className="text-xs text-gray-500">{p.phone}</p>
                          )}
                          {p.patient_email && (
                            <p className="text-xs text-gray-400">{p.patient_email}</p>
                          )}
                        </>
                      )}
                    </div>
                    <SourceBadge source={p.source} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">#{i + 1}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicControlQueue;
