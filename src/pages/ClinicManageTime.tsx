import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Save } from "lucide-react";

interface TimeSlot {
  hour: number;
  available: boolean;
}

interface DaySchedule {
  id: string;
  dayName: string;
  date: string;
  available: boolean;
  slots: TimeSlot[];
}

const ClinicManageTime = () => {
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [days, setDays] = useState<DaySchedule[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const generateDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newDays: DaySchedule[] = [];
    
    // Generate slots based on current start/end hours
    const slots: TimeSlot[] = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push({ hour, available: true });
    }
    
    for (let i = 0; i < 1; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateStr = date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      });
      
      newDays.push({
        id: `day-${i}`,
        dayName: "Today",
        date: dateStr,
        available: true,
        slots: [...slots]
      });
    }
    
    setDays(newDays);
  };

  const fetchTimeData = async () => {
    const clinic_id = localStorage.getItem("clinic_id");
    if (!clinic_id) return;

    try {
      // Fetch clinic data (includes start, end, available)
      const clinicResponse = await fetch(`http://localhost:8000/auth/clinic/data?clinic_id=${clinic_id}`);
      const clinicData = await clinicResponse.json();

      // Set operating hours from clinic data
      if (clinicData.start && clinicData.end) {
        setStartHour(clinicData.start);
        setEndHour(clinicData.end);
      }

      // Fetch time data for not_available slots
      const timeResponse = await fetch(`http://localhost:8000/auth/clinic/get-time?clinic_id=${clinic_id}`);
      const timeData = await timeResponse.json();

      // Update days with fetched data
      setDays(prev => prev.map(day => ({
        ...day,
        available: clinicData.available !== undefined ? clinicData.available : day.available,
        slots: day.slots.map(slot => {
          const notAvailable = timeData.not_available?.split(",").map(Number) || [];
          return {
            ...slot,
            available: !notAvailable.includes(slot.hour)
          };
        })
      })));
    } catch (error) {
      console.error("Error fetching time data:", error);
    }
  };

  useEffect(() => {
    fetchTimeData();
  }, []);

  useEffect(() => {
    generateDays();
  }, [startHour, endHour]);

  const updateTimeRange = (type: 'start' | 'end', value: number) => {
    if (type === 'start') {
      setStartHour(value);
      if (value >= endHour) {
        setEndHour(value + 1);
      }
    } else {
      setEndHour(value);
      if (value <= startHour) {
        setStartHour(value - 1);
      }
    }
    setSaved(false);
  };

  const formatHour = (hour: number) => {
    if (hour === 12) return "12 PM";
    if (hour === 13) return "1 PM";
    if (hour === 14) return "2 PM";
    if (hour === 15) return "3 PM";
    if (hour === 16) return "4 PM";
    if (hour === 17) return "5 PM";
    if (hour === 18) return "6 PM";
    if (hour === 19) return "7 PM";
    if (hour === 20) return "8 PM";
    if (hour === 21) return "9 PM";
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const toggleDayAvailability = (dayId: string) => {
    setDays(prev => prev.map(day =>
      day.id === dayId ? { ...day, available: !day.available } : day
    ));
    setSaved(false);
  };

  const toggleSlotAvailability = (dayId: string, hour: number) => {
    setDays(prev => prev.map(day =>
      day.id === dayId 
        ? {
            ...day,
            slots: day.slots.map(slot =>
              slot.hour === hour ? { ...slot, available: !slot.available } : slot
            )
          }
        : day
    ));
    setSaved(false);
  };

  const saveSchedule = async () => {
    setSaving(true);
    
    // Get clinic_id from localStorage
    const clinic_id = localStorage.getItem("clinic_id");
    
    if (!clinic_id) {
      alert("Error: Clinic not logged in!");
      setSaving(false);
      return;
    }
    
    // Get today's availability status (from Today row)
    const todayAvailability = days[0]?.available ?? true;
    
    // Get unavailable hours (slots that are NOT available)
    const unavailableHours = days[0]?.slots
      .filter(slot => !slot.available)
      .map(slot => slot.hour)
      .join(",");
    
    console.log("Saving:", { clinic_id, available: todayAvailability, startHour, endHour, unavailableHours });
    
    try {
      // Save availability status
      await fetch("http://localhost:8000/auth/clinic/update-availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: clinic_id,
          available: todayAvailability,
        }),
      });
      
      // Save time data (starting, ending, not_available)
      const clinicData = localStorage.getItem("clinicData");
      const clinic = clinicData ? JSON.parse(clinicData) : null;
      const email = clinic?.email || "";
      
      await fetch("http://localhost:8000/auth/clinic/save-time", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: clinic_id,
          email: email,
          starting: startHour,
          ending: endHour,
          not_available: unavailableHours,
        }),
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Network error. Make sure backend is running.");
    } finally {
      setSaving(false);
    }
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(formatHour(hour));
    }
    return slots;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/clinic" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Manage Time</h1>
          </div>
          <Button
            onClick={saveSchedule}
            disabled={saving}
            className="bg-[#00555A] text-white hover:bg-[#00494F]"
          >
            {saving ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <label className="block text-sm text-gray-600 mb-2">From</label>
              <select
                value={startHour}
                onChange={(e) => updateTimeRange('start', parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none"
              >
                {Array.from({ length: 14 }, (_, i) => i + 8).map(hour => (
                  <option key={hour} value={hour}>{formatHour(hour)}</option>
                ))}
              </select>
            </div>

            <span className="text-gray-500">to</span>

            <div className="text-center">
              <label className="block text-sm text-gray-600 mb-2">To</label>
              <select
                value={endHour}
                onChange={(e) => updateTimeRange('end', parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none"
              >
                {Array.from({ length: 14 }, (_, i) => i + 9).filter(h => h > startHour).map(hour => (
                  <option key={hour} value={hour}>{formatHour(hour)}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-1 flex-wrap">
            {days[0]?.slots.map((slot) => (
              <button
                key={slot.hour}
                onClick={() => days.forEach(day => toggleSlotAvailability(day.id, slot.hour))}
                className={`px-3 py-1 text-sm rounded ${
                  slot.available 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {formatHour(slot.hour)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h2>
          
          <div className="space-y-3">
            {days.map((day) => (
              <div 
                key={day.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{day.dayName}</h3>
                  <p className="text-sm text-gray-500">{day.date}</p>
                </div>
                
                <button
                  onClick={() => toggleDayAvailability(day.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    day.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {day.available ? 'Available' : 'Not Available'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicManageTime;
