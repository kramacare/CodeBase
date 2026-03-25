import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, Clock, Building2, UserCheck, Users, Timer } from "lucide-react";

interface QueuePosition {
  patients_ahead: number;
  estimated_wait_minutes: number;
  your_position: number;
  total_in_queue: number;
  current_token: number;
}

const TrackQueue = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [queuePosition, setQueuePosition] = useState<QueuePosition | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    clinic = "CityCare Clinic",
    doctor = "Dr. Ananya Sharma",
    token = "T-454",
    address = "",
    date = "",
    time = "",
  } = state || {};

  useEffect(() => {
    const fetchQueuePosition = async () => {
      try {
        // Get patient email from localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          
          // Fetch appointments for this patient
          const response = await fetch(`http://localhost:8000/auth/patient/appointments?email=${user.email}`);
          if (response.ok) {
            const data = await response.json();
            if (data.appointments && data.appointments.length > 0) {
              const latestAppointment = data.appointments[0];
              
              // Fetch queue position based on token
              const queueResponse = await fetch(
                `http://localhost:8000/auth/appointments/queue-position?clinic_id=${latestAppointment.clinic_id}&appointment_token=${latestAppointment.token}&appointment_id=${latestAppointment.id}`
              );
              if (queueResponse.ok) {
                const queueData = await queueResponse.json();
                setQueuePosition(queueData);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching queue position:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueuePosition();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading queue information...</p>
        </div>
      </div>
    );
  }

  // Use actual data from database, fallback to calculated values
  const patientsAhead = queuePosition?.patients_ahead ?? 0;
  const estimatedWait = queuePosition?.estimated_wait_minutes ?? 0;
  const yourPosition = queuePosition?.your_position ?? 1;
  const totalInQueue = queuePosition?.total_in_queue ?? 1;
  const nowServingNum = (queuePosition?.current_token ?? 1) - 1;
  const nowServing = `A-${nowServingNum > 0 ? nowServingNum : 1}`;

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

          {/* QUEUE DETAILS - Actual from database */}
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Now Serving:
              </span>
              <span className="font-medium text-[#00555A]">{nowServing}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Patients ahead:
              </span>
              <span className="font-semibold text-[#0F172A]">{patientsAhead}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Estimated wait:
              </span>
              <span className="font-medium text-[#0F172A]">{estimatedWait} mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Your position:</span>
              <span className="font-semibold text-[#0F172A]">{yourPosition} of {totalInQueue}</span>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mb-6">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00555A] rounded-full transition-all duration-300"
                style={{ width: `${totalInQueue > 0 ? (yourPosition / totalInQueue) * 100 : 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {yourPosition} of {totalInQueue} patients
            </p>
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
