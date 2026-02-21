import { useLocation, useNavigate } from "react-router-dom";
import { useQueue } from "@/context/QueueContext";
import { MapPin, Clock, Building2, UserCheck } from "lucide-react";

const TrackQueue = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { currentToken } = useQueue();

  const {
    clinic = "CityCare Clinic",
    doctor = "Dr. Ananya Sharma",
    token = "T-454",
    address = "",
    date = "",
    time = "",
  } = state || {};

  // Calculate queue values
  const getTokenNumber = (tokenStr: string) => {
    const match = tokenStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const patientTokenNum = getTokenNumber(token);
  const patientsAhead = Math.max(0, patientTokenNum - currentToken);
  const nowServing = `A-${currentToken}`;
  const estimatedWait = patientsAhead * 5;

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-center text-[#0F172A] mb-2">
            Live Queue Tracker
          </h1>
          <p className="text-center text-gray-600 text-sm mb-6">
            Watch your turn progress
          </p>

          {/* TOKEN */}
          <div className="bg-[#FFC107] rounded-xl p-6 mb-6 text-center">
            <p className="text-xs uppercase tracking-wide text-[#0F172A] font-medium">
              Your Token
            </p>
            <p className="font-extrabold text-[#0F172A] text-5xl tracking-widest leading-none mt-2">
              {token}
            </p>
          </div>

          {/* CLINIC INFORMATION */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#00555A]" />
              Clinic Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Clinic Name</p>
                  <p className="font-medium text-[#0F172A]">{clinic}</p>
                </div>
              </div>
              {address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Address</p>
                    <p className="font-medium text-[#0F172A]">{address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <UserCheck className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Doctor</p>
                  <p className="font-medium text-[#0F172A]">{doctor}</p>
                </div>
              </div>
              {date && time && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Date & Time</p>
                    <p className="font-medium text-[#0F172A]">{date} at {time}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QUEUE DETAILS */}
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Now Serving:</span>
              <span className="font-medium text-[#00555A]">{nowServing}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Patients ahead:</span>
              <span className="font-semibold text-[#0F172A]">{patientsAhead}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated wait:</span>
              <span className="font-medium text-[#0F172A]">{estimatedWait} mins</span>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mb-6">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00555A] rounded-full transition-all duration-300"
                style={{ width: `${100 - patientsAhead * 10}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => navigate("/patient")}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-[#0F172A] hover:bg-gray-50 transition-all duration-200"
          >
            Back to Dashboard
          </button>
      </div>
    </div>
  );
};

export default TrackQueue;
