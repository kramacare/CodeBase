import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

const JoinQueue = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<{text: string; type: "success" | "error"} | null>(null);

  const [name, setName] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleJoinQueue = async () => {
    if (!name.trim() || !selectedDoctorId || !selectedClinicId || !selectedCategoryId) {
      setMessage({text: "Please fill all fields", type: "error"});
      return;
    }

    try {
      const res = await fetch("http://localhost:5050/api/tokens/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          clinicId: selectedClinicId,
          categoryId: selectedCategoryId,
          patientName: name,
          source: "ONLINE"
        })
      });

      const data = await res.json();

      navigate("/track", {
        state: {
          token: data.tokenLabel,
          tokenNumber: data.tokenNumber
        }
      });

    } catch (err) {
      setMessage({text: "Failed to join queue", type: "error"});
    }
  };

  return (
    <MainLayout>
      {message && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
          message.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {message.text}
        </div>
      )}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-center text-[#0F172A] mb-8">Join Queue</h1>

          <div className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0F172A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFF0] transition-all duration-200"
            />

            <select
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00FFF0] transition-all duration-200"
            >
              <option value="">Select Clinic</option>
              <option value="1">City Medical Center</option>
            </select>

            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00FFF0] transition-all duration-200"
            >
              <option value="">Select Category</option>
              <option value="1">General</option>
              <option value="2">Dermat</option>
              <option value="3">ENT</option>
            </select>

            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00FFF0] transition-all duration-200"
            >
              <option value="">Select Doctor</option>
              <option value="1">Dr. John Smith</option>
              <option value="2">Dr. Sarah Johnson</option>
              <option value="3">Dr. Michael Brown</option>
            </select>
          </div>

          <Button 
            onClick={handleJoinQueue} 
            className="mt-8 w-full bg-[#00555A] text-white hover:opacity-90 rounded-xl px-4 py-3 transition-all duration-200 font-medium"
          >
            Join Queue
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default JoinQueue;
