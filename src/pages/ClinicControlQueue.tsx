import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueue } from "@/context/QueueContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, SkipForward, ArrowRightCircle, RefreshCw, Clock } from "lucide-react";

const ClinicControlQueue = () => {
  const {
    queue,
    nextPatient,
    skipPatient,
    currentToken,
    completedCount,
    skippedCount,
    totalToday,
    currentServing,
    fetchQueueForClinic
  } = useQueue();
  
  const [clinicId, setClinicId] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Get clinic_id from localStorage on mount
  useEffect(() => {
    const clinicStr = localStorage.getItem("clinic_id");
    if (clinicStr) {
      setClinicId(clinicStr);
      fetchQueueForClinic(clinicStr);
    }
  }, [fetchQueueForClinic]);

  // Update elapsed time every second when a patient is being served
  useEffect(() => {
    if (currentServing && currentServing.startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const start = new Date(currentServing.startTime!);
        const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedTime(diff);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [currentServing]);

  const handleRefreshQueue = () => {
    if (window.confirm("Are you sure you want to refresh the queue? This will clear all current data and start fresh for today.")) {
      if (clinicId) {
        fetchQueueForClinic(clinicId);
      }
    }
  };

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link
            to="/clinic"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Go back"
          >
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

          {/* SUMMARY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Total Today</p>
              <p className="text-2xl font-bold text-[#0F172A]">{totalToday}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-[#FFC107]">
                {completedCount}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Waiting</p>
              <p className="text-2xl font-bold text-[#00555A]">
                {queue.length}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Skipped</p>
              <p className="text-2xl font-bold text-[#FFA000]">
                {skippedCount}
              </p>
            </div>
          </div>

          {/* NOW SERVING */}
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">Now Serving</p>
            <div className="text-5xl font-extrabold text-[#0F172A]">
              A-{currentToken}
            </div>
            
            {/* Current Patient Info */}
            {currentServing ? (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-[#0F172A]">
                  {currentServing.patientName} ({currentServing.token})
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Elapsed: {formatTime(elapsedTime)}</span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-gray-500">No patient currently being served</p>
            )}
          </div>

          {/* CONTROLS */}
          <div className="flex gap-4 mb-6">
            <Button 
              className="flex-1 bg-[#00555A] text-white hover:opacity-90 rounded-xl transition-all duration-200" 
              onClick={() => nextPatient()}
            >
              <ArrowRightCircle className="mr-2" size={18} />
              Next
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

          {/* QUEUE LIST */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-[#0F172A]" />
              <h2 className="font-semibold text-[#0F172A]">Waiting Queue</h2>
            </div>

            {queue.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No patients in queue</p>
            ) : (
              queue.map((p, i) => (
                <div
                  key={p.token}
                  className="flex justify-between items-center rounded-lg bg-gray-50 px-4 py-3 mb-2 last:mb-0"
                >
                  <div>
                    <p className="font-medium text-[#0F172A]">
                      {p.token} — {p.name}
                    </p>
                    <span className="text-xs text-gray-600">
                      {p.source.toUpperCase()}
                    </span>
                  </div>

                  <span className="text-xs text-gray-600 font-medium">
                    #{i + 1}
                  </span>
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
