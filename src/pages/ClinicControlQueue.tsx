import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueue } from "@/context/QueueContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, SkipForward, ArrowRightCircle, Plus, Settings, RefreshCw } from "lucide-react";

const ClinicControlQueue = () => {
  const {
    queue,
    nextPatient,
    skipPatient,
    addPatient,
    currentToken,
    completedCount,
    skippedCount,
    totalToday,
    resetQueue,
  } = useQueue();

  const [name, setName] = useState("");

  const handleDeskAdd = () => {
    if (!name.trim()) return;
    addPatient(name, "desk");
    setName("");
  };

  const handleRefreshQueue = () => {
    if (window.confirm("Are you sure you want to refresh the queue? This will clear all current data and start fresh for today.")) {
      resetQueue();
    }
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
            Refresh Queue
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-[#0F172A] mb-6">Clinic Queue Control</h1>

          {/* ADD WALK-IN */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <Plus size={18} /> Add Walk-in Patient
            </h2>

            <div className="flex gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Patient name"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-[#0F172A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFF0] transition-all duration-200"
              />
              <Button 
                onClick={handleDeskAdd}
                className="bg-[#00555A] text-white hover:opacity-90 rounded-xl px-4 py-2 transition-all duration-200"
              >
                Add
              </Button>
            </div>
          </div>

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
          </div>

          {/* CONTROLS */}
          <div className="flex gap-4 mb-6">
            <Button 
              className="flex-1 bg-[#00555A] text-white hover:opacity-90 rounded-xl transition-all duration-200" 
              onClick={nextPatient}
            >
              <ArrowRightCircle className="mr-2" size={18} />
              Next
            </Button>

            <Button 
              variant="outline" 
              className="flex-1 border-gray-300 text-[#0F172A] hover:bg-gray-50 rounded-xl transition-all duration-200" 
              onClick={skipPatient}
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

            {queue.map((p, i) => (
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
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicControlQueue;
