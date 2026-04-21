import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { ArrowLeft, Clock, Save, Plus, Trash2, Users } from "lucide-react";



interface Slot {

  slot_name: string;

  time_range: number[];  // [start_hour, end_hour] e.g., [8, 11]

  is_open: boolean;

}



const MAX_SLOTS = 3;



const ClinicManageTime = () => {

  const [slots, setSlots] = useState<Slot[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);

  

  // Form state for new slot

  const [newSlot, setNewSlot] = useState({

    slot_name: "",

    start_hour: 8,

    end_hour: 11

  });



  const clinicId = localStorage.getItem("clinic_id");



  const fetchTimeSlots = async () => {

    if (!clinicId) return;

    

    try {

      const response = await fetch(`http://localhost:8000/auth/clinic/time-slots?clinic_id=${clinicId}`);

      if (response.ok) {

        const data = await response.json();

        console.log("Fetched time slots:", data);

        // Use slot array from database to determine is_open status
        const slotArray = data.slot || [];
        const updatedSlots = (data.slots || []).map((s: any, idx: number) => ({
          ...s,
          is_open: slotArray[idx] === "open"
        }));

        setSlots(updatedSlots);

      }

    } catch (error) {

      console.error("Error fetching time slots:", error);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchTimeSlots();

  }, [clinicId]);



  const addTimeSlot = async () => {

    if (!clinicId) return;

    if (slots.length >= MAX_SLOTS) return;

    

    setSaving(true);

    try {

      const response = await fetch("http://localhost:8000/auth/clinic/time-slots", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          clinic_id: clinicId,

          slot_name: newSlot.slot_name,

          time_range: [newSlot.start_hour, newSlot.end_hour]

        }),

      });

      

      if (response.ok) {

        setShowAddForm(false);

        setNewSlot({ slot_name: "", start_hour: 8, end_hour: 11 });

        fetchTimeSlots();

        setSaved(true);

        setTimeout(() => setSaved(false), 2000);

      }

    } catch (error) {

      console.error("Error adding time slot:", error);

    } finally {

      setSaving(false);

    }

  };



  const deleteTimeSlot = async (slotIndex: number) => {

    if (!confirm("Are you sure you want to delete this time slot?")) return;

    

    try {

      const response = await fetch(`http://localhost:8000/auth/clinic/time-slots/${slotIndex}?clinic_id=${clinicId}`, {

        method: "DELETE",

      });

      

      if (response.ok) {

        fetchTimeSlots();

      }

    } catch (error) {

      console.error("Error deleting time slot:", error);

    }

  };



  const toggleSlotStatus = async (slotIndex: number, isOpen: boolean) => {

    try {

      console.log(`Setting slot ${slotIndex} to ${isOpen ? 'open' : 'close'}`);

      const response = await fetch(`http://localhost:8000/auth/clinic/time-slots/${slotIndex}`, {

        method: "PUT",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ 

          clinic_id: clinicId, 

          is_open: isOpen,

          slot: isOpen ? "open" : "close"

        }),

      });

      

      if (response.ok) {

        const data = await response.json();

        console.log("Response:", data);

        fetchTimeSlots();

      } else {

        console.error("Failed to update slot status");

      }

    } catch (error) {

      console.error("Error updating slot status:", error);

    }

  };



  const formatTime = (time: string) => {

    const [hours, minutes] = time.split(":");

    const hour = parseInt(hours);

    const ampm = hour >= 12 ? "PM" : "AM";

    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

    return `${displayHour}:${minutes} ${ampm}`;

  };



  return (

    <div className="min-h-screen bg-gray-50">

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">

        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">

          <div className="flex items-center gap-3">

            <Link to="/clinic" className="text-gray-600 hover:text-gray-900">

              <ArrowLeft className="h-5 w-5" />

            </Link>

            <h1 className="text-xl font-bold text-gray-900">Manage Time Slots</h1>

          </div>

          <Button

            onClick={() => setShowAddForm(true)}

            disabled={slots.length >= MAX_SLOTS}

            className="bg-[#00555A] text-white hover:bg-[#00494F]"

          >

            <Plus className="mr-2 h-4 w-4" />

            Add Slot

          </Button>

        </div>

      </header>



      <main className="mx-auto max-w-4xl px-4 py-6">

        {/* Add New Slot Form */}

        {showAddForm && (

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-[#00555A]/20">

            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Time Slot</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

              <div>

                <label className="block text-sm text-gray-600 mb-2">Slot Name</label>

                <select

                  title="Select slot name"

                  value={newSlot.slot_name}

                  onChange={(e) => setNewSlot({ ...newSlot, slot_name: e.target.value })}

                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00555A] bg-white"

                >

                  <option value="">Select...</option>

                  {!slots.find(s => s.slot_name === "Time 1") && <option value="Time 1">Time 1</option>}

                  {!slots.find(s => s.slot_name === "Time 2") && <option value="Time 2">Time 2</option>}

                  {!slots.find(s => s.slot_name === "Time 3") && <option value="Time 3">Time 3</option>}

                </select>

              </div>

              <div>

                <label className="block text-sm text-gray-600 mb-2">Start Hour (0-23)</label>

                <input

                  type="number"

                  min="0"

                  max="23"

                  value={newSlot.start_hour}

                  onChange={(e) => setNewSlot({ ...newSlot, start_hour: parseInt(e.target.value) || 0 })}

                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00555A]"

                />

              </div>

              <div>

                <label className="block text-sm text-gray-600 mb-2">End Hour (0-23)</label>

                <input

                  type="number"

                  min="0"

                  max="23"

                  value={newSlot.end_hour}

                  onChange={(e) => setNewSlot({ ...newSlot, end_hour: parseInt(e.target.value) || 0 })}

                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00555A]"

                />

              </div>

            </div>

            <div className="flex gap-3">

              <Button

                onClick={addTimeSlot}

                disabled={saving}

                className="bg-[#00555A] text-white hover:bg-[#00494F]"

              >

                {saving ? (

                  <>

                    <Clock className="mr-2 h-4 w-4 animate-spin" />

                    Saving...

                  </>

                ) : (

                  <>

                    <Save className="mr-2 h-4 w-4" />

                    Save Slot

                  </>

                )}

              </Button>

              <Button

                variant="outline"

                onClick={() => setShowAddForm(false)}

                className="border-gray-300"

              >

                Cancel

              </Button>

            </div>

          </div>

        )}



        {/* Time Slots List */}

        <div className="bg-white rounded-lg shadow-sm p-6">

          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Time Slots</h2>

          <p className="mb-4 text-sm text-gray-500">{slots.length}/{MAX_SLOTS} slots used</p>

          

          {loading ? (

            <div className="text-center py-8 text-gray-500">Loading...</div>

          ) : slots.length === 0 ? (

            <div className="text-center py-8 text-gray-500">

              <p className="mb-4">No time slots set up yet.</p>

              <p className="text-sm">Click "Add Slot" to create time slots like "Morning 8:00-11:00" or "Evening 15:00-18:00"</p>

            </div>

          ) : (

            <div className="space-y-4">

              {slots.map((slot, index) => (

                <div

                  key={index}

                  className={`border rounded-lg p-4 ${slot.is_open ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}

                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                      <div>

                        <h3 className="font-semibold text-gray-900">{slot.slot_name}</h3>

                        <p className="text-sm text-gray-600">

                          {slot.time_range[0]}:00 - {slot.time_range[1]}:00

                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      {/* Toggle Button - shows Open when closed, Close when open */}

                      <button

                        title={slot.is_open ? 'Close slot' : 'Open slot'}

                        onClick={() => toggleSlotStatus(index, !slot.is_open)}

                        className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${

                          slot.is_open 

                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 

                            : 'bg-green-100 text-green-600 hover:bg-green-200'

                        }`}

                      >

                        {slot.is_open ? 'Close' : 'Open'}

                      </button>

                      <button

                        title="Delete slot"

                        onClick={() => deleteTimeSlot(index)}

                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"

                      >

                        <Trash2 className="h-4 w-4" />

                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>



        {/* Instructions */}

        <div className="bg-blue-50 rounded-lg p-4 mt-6">

          <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>

          <ul className="text-sm text-blue-800 space-y-1">

            <li>• Add time slots like Morning [8, 11], Evening [17, 20]</li>

            <li>• Click Open/Closed to control slot availability</li>

            <li>• Patients will see available slots when booking</li>

          </ul>

        </div>

      </main>

    </div>

  );

};



export default ClinicManageTime;

