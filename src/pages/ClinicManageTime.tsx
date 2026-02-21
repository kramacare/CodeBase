import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Clock, Calendar, Edit, Trash2 } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  available: boolean;
  timeSlots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface DaySchedule {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  doctors: Doctor[];
}

const ClinicManageTime = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: "1",
      name: "Dr. Ananya Sharma",
      specialization: "General Physician",
      available: true,
      timeSlots: [
        { id: "1", time: "9:00 AM", available: true },
        { id: "2", time: "9:30 AM", available: true },
        { id: "3", time: "10:00 AM", available: true },
        { id: "4", time: "10:30 AM", available: false },
        { id: "5", time: "11:00 AM", available: true },
        { id: "6", time: "11:30 AM", available: true },
        { id: "7", time: "12:00 PM", available: false },
        { id: "8", time: "12:30 PM", available: true },
        { id: "9", time: "1:00 PM", available: true },
        { id: "10", time: "1:30 PM", available: false },
        { id: "11", time: "2:00 PM", available: true },
        { id: "12", time: "2:30 PM", available: true },
        { id: "13", time: "3:00 PM", available: false },
        { id: "14", time: "3:30 PM", available: true },
        { id: "15", time: "4:00 PM", available: false },
        { id: "16", time: "4:30 PM", available: true },
        { id: "17", time: "5:00 PM", available: true },
        { id: "18", time: "5:30 PM", available: false },
        { id: "19", time: "6:00 PM", available: true },
        { id: "20", time: "6:30 PM", available: true },
        { id: "21", time: "7:00 PM", available: false },
        { id: "22", time: "7:30 PM", available: true },
        { id: "23", time: "8:00 PM", available: false },
        { id: "24", time: "8:30 PM", available: true },
        { id: "25", time: "9:00 PM", available: false },
      ]
    },
    {
      id: "2", 
      name: "Dr. Rahul Kumar",
      specialization: "Cardiologist",
      available: false,
      timeSlots: [
        { id: "1", time: "9:00 AM", available: false },
        { id: "2", time: "9:30 AM", available: false },
        { id: "3", time: "10:00 AM", available: false },
        { id: "4", time: "10:30 AM", available: false },
        { id: "5", time: "11:00 AM", available: false },
        { id: "6", time: "11:30 AM", available: false },
        { id: "7", time: "12:00 PM", available: false },
        { id: "8", time: "12:30 PM", available: false },
        { id: "9", time: "1:00 PM", available: false },
        { id: "10", time: "1:30 PM", available: false },
        { id: "11", time: "2:00 PM", available: false },
        { id: "12", time: "2:30 PM", available: false },
        { id: "13", time: "3:00 PM", available: false },
        { id: "14", time: "3:30 PM", available: false },
        { id: "15", time: "4:00 PM", available: false },
        { id: "16", time: "4:30 PM", available: false },
        { id: "17", time: "5:00 PM", available: false },
        { id: "18", time: "5:30 PM", available: false },
        { id: "19", time: "6:00 PM", available: false },
        { id: "20", time: "6:30 PM", available: false },
        { id: "21", time: "7:00 PM", available: false },
        { id: "22", time: "7:30 PM", available: false },
        { id: "23", time: "8:00 PM", available: false },
        { id: "24", time: "8:30 PM", available: false },
      ]
    },
    {
      id: "3",
      name: "Dr. Priya Patel",
      specialization: "Pediatrician",
      available: true,
      timeSlots: [
        { id: "1", time: "9:00 AM", available: false },
        { id: "2", time: "9:30 AM", available: false },
        { id: "3", time: "10:00 AM", available: false },
        { id: "4", time: "10:30 AM", available: false },
        { id: "5", time: "11:00 AM", available: false },
        { id: "6", time: "11:30 AM", available: false },
        { id: "7", time: "12:00 PM", available: false },
        { id: "8", time: "12:30 PM", available: false },
        { id: "9", time: "1:00 PM", available: false },
        { id: "10", time: "1:30 PM", available: false },
        { id: "11", time: "2:00 PM", available: false },
        { id: "12", time: "2:30 PM", available: false },
        { id: "13", time: "3:00 PM", available: false },
        { id: "14", time: "3:30 PM", available: false },
        { id: "15", time: "4:00 PM", available: false },
        { id: "16", time: "4:30 PM", available: false },
        { id: "17", time: "5:00 PM", available: false },
        { id: "18", time: "5:30 PM", available: false },
        { id: "19", time: "6:00 PM", available: false },
        { id: "20", time: "6:30 PM", available: false },
        { id: "21", time: "7:00 PM", available: false },
        { id: "22", time: "7:30 PM", available: false },
        { id: "23", time: "8:00 PM", available: false },
        { id: "24", time: "8:30 PM", available: false },
      ]
    }
  ]);

  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([
    { day: "Monday", isOpen: true, openTime: "9:00 AM", closeTime: "6:00 PM", doctors: [doctors[0], doctors[2]] },
    { day: "Tuesday", isOpen: true, openTime: "9:00 AM", closeTime: "6:00 PM", doctors: [doctors[0], doctors[1], doctors[2]] },
    { day: "Wednesday", isOpen: true, openTime: "9:00 AM", closeTime: "6:00 PM", doctors: [doctors[0], doctors[1]] },
    { day: "Thursday", isOpen: true, openTime: "9:00 AM", closeTime: "6:00 PM", doctors: [doctors[0], doctors[1]] },
    { day: "Friday", isOpen: true, openTime: "9:00 AM", closeTime: "6:00 PM", doctors: [doctors[0], doctors[1], doctors[2]] },
    { day: "Saturday", isOpen: false, openTime: "Closed", closeTime: "Closed", doctors: [] },
    { day: "Sunday", isOpen: false, openTime: "Closed", closeTime: "Closed", doctors: [] },
  ]);

  const [editingDoctor, setEditingDoctor] = useState<string | null>(null);

  const toggleDoctorAvailability = (doctorId: string) => {
    setDoctors(prev => prev.map(doc => 
      doc.id === doctorId ? { ...doc, available: !doc.available } : doc
    ));
  };

  const toggleTimeSlot = (doctorId: string, slotId: string) => {
    setDoctors(prev => prev.map(doc => 
      doc.id === doctorId 
        ? {
            ...doc,
            timeSlots: doc.timeSlots.map(slot =>
              slot.id === slotId ? { ...slot, available: !slot.available } : slot
            )
          }
        : doc
    ));
  };

  const toggleDaySchedule = (dayIndex: number) => {
    setWeekSchedule(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, isOpen: !day.isOpen } : day
    ));
  };

  const deleteDoctor = (doctorId: string) => {
    if (window.confirm("Are you sure you want to remove this doctor?")) {
      setDoctors(prev => prev.filter(doc => doc.id !== doctorId));
    }
  };

  const updateDoctor = (doctorId: string, field: 'name' | 'specialization', value: string) => {
    setDoctors(prev => prev.map(doc => 
      doc.id === doctorId ? { ...doc, [field]: value } : doc
    ));
    setEditingDoctor(null);
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
          <span className="font-semibold text-foreground">Manage Time</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-12">
        {/* Doctors List */}
        <div className="space-y-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#00555A] text-white flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A]">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingDoctor(doctor.id)}
                    className="border-gray-300 text-[#0F172A] hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteDoctor(doctor.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  doctor.available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {doctor.available ? 'Available' : 'Unavailable'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDoctorAvailability(doctor.id)}
                  className={`${
                    doctor.available
                      ? 'border-red-300 text-red-600 hover:bg-red-50'
                      : 'border-green-300 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {doctor.available ? 'Set Unavailable' : 'Set Available'}
                </Button>
              </div>

              {/* Time Slots */}
              <div>
                <h4 className="font-medium text-[#0F172A] mb-3">Available Time Slots (24 Hours)</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-1 max-h-96 overflow-y-auto">
                  {doctor.timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => toggleTimeSlot(doctor.id, slot.id)}
                      className={`p-1 rounded text-xs font-medium transition-all duration-200 ${
                        slot.available
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Mode */}
              {editingDoctor === doctor.id && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-[#0F172A] mb-3">Edit Doctor Information</h4>
                  <div className="flex gap-3">
                    <Input
                      defaultValue={doctor.name}
                      placeholder="Doctor name"
                      className="flex-1"
                      onChange={(e) => updateDoctor(doctor.id, 'name', e.target.value)}
                    />
                    <Input
                      defaultValue={doctor.specialization}
                      placeholder="Specialization"
                      className="flex-1"
                      onChange={(e) => updateDoctor(doctor.id, 'specialization', e.target.value)}
                    />
                    <Button
                      onClick={() => setEditingDoctor(null)}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-8">
          <h2 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </h2>
          <div className="space-y-3">
            {weekSchedule.map((day, index) => (
              <div key={day.day} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    day.isOpen ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-[#0F172A]">{day.day}</p>
                    <p className="text-sm text-gray-600">
                      {day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'Closed'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDaySchedule(index)}
                    className={`${
                      day.isOpen
                        ? 'border-red-300 text-red-600 hover:bg-red-50'
                        : 'border-green-300 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {day.isOpen ? 'Close Day' : 'Open Day'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicManageTime;
