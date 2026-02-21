import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

const JoinQueue = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const handleJoinQueue = async () => {
    if (!name.trim() || !selectedDoctorId || !selectedClinicId || !selectedCategoryId) {
      alert("Please fill all fields");
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
      console.log("TOKEN CREATED:", data);

      navigate("/track", {
        state: {
          token: data.tokenLabel,
          tokenNumber: data.tokenNumber
        }
      });

    } catch (err) {
      console.error("Failed to join queue:", err);
      alert("Failed to join queue");
    }
  };

  return (
    <MainLayout>
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
