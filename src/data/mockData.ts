export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  distance: string;
  rating: number;
  reviewCount: number;
  phone: string;
  doctors: Doctor[];
  specializations: string[];
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  specialization: string;
  nextAvailable: string;
  avatar?: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  clinic: Clinic;
  doctor: Doctor;
  date: string;
  time: string;
  token: string;
}

const generateSlots = (available: number[]): TimeSlot[] => {
  const times = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM",
    "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
    "04:30 PM", "05:00 PM",
  ];
  return times.map((time, i) => ({
    id: `slot-${i}`,
    time,
    available: available.includes(i),
  }));
};

export const mockClinics: Clinic[] = [
  {
    id: "clinic-1",
    name: "CityCare Clinic",
    address: "42 MG Road, Indiranagar",
    city: "Bangalore",
    distance: "0.8 km",
    rating: 4.6,
    reviewCount: 128,
    phone: "+91 98765 43210",
    specializations: ["General Physician", "Pediatrician"],
    doctors: [
      {
        id: "doc-1",
        name: "Dr. Ananya Sharma",
        department: "General Medicine",
        specialization: "General Physician",
        nextAvailable: "Today, 10:30 AM",
        slots: generateSlots([2, 3, 5, 7, 8, 10, 12]),
      },
      {
        id: "doc-2",
        name: "Dr. Rahul Menon",
        department: "Pediatrics",
        specialization: "Pediatrician",
        nextAvailable: "Today, 11:00 AM",
        slots: generateSlots([0, 4, 6, 9, 11, 13]),
      },
    ],
  },
  {
    id: "clinic-2",
    name: "Apollo Family Clinic",
    address: "15 Residency Road, Shantinagar",
    city: "Bangalore",
    distance: "1.2 km",
    rating: 4.8,
    reviewCount: 256,
    phone: "+91 98765 11111",
    specializations: ["Dentist", "General Physician"],
    doctors: [
      {
        id: "doc-3",
        name: "Dr. Priya Desai",
        department: "Dentistry",
        specialization: "Dentist",
        nextAvailable: "Today, 02:00 PM",
        slots: generateSlots([1, 3, 7, 8, 9, 12, 13]),
      },
      {
        id: "doc-4",
        name: "Dr. Vikram Iyer",
        department: "General Medicine",
        specialization: "General Physician",
        nextAvailable: "Tomorrow, 09:00 AM",
        slots: generateSlots([0, 1, 2, 5, 6, 10, 11]),
      },
    ],
  },
  {
    id: "clinic-3",
    name: "GreenLife Diagnostics",
    address: "88 Koramangala 4th Block",
    city: "Bangalore",
    distance: "2.5 km",
    rating: 4.4,
    reviewCount: 89,
    phone: "+91 98765 22222",
    specializations: ["General Physician", "Dermatologist"],
    doctors: [
      {
        id: "doc-5",
        name: "Dr. Sneha Kulkarni",
        department: "Dermatology",
        specialization: "Dermatologist",
        nextAvailable: "Today, 03:30 PM",
        slots: generateSlots([2, 4, 5, 9, 10, 13]),
      },
    ],
  },
  {
    id: "clinic-4",
    name: "MedFirst Health Centre",
    address: "27 Jayanagar 9th Block",
    city: "Bangalore",
    distance: "3.1 km",
    rating: 4.3,
    reviewCount: 67,
    phone: "+91 98765 33333",
    specializations: ["Pediatrician", "ENT"],
    doctors: [
      {
        id: "doc-6",
        name: "Dr. Arun Nair",
        department: "ENT",
        specialization: "ENT Specialist",
        nextAvailable: "Today, 04:00 PM",
        slots: generateSlots([0, 3, 6, 8, 11, 12]),
      },
      {
        id: "doc-7",
        name: "Dr. Kavitha Reddy",
        department: "Pediatrics",
        specialization: "Pediatrician",
        nextAvailable: "Tomorrow, 10:00 AM",
        slots: generateSlots([1, 2, 5, 7, 9, 13]),
      },
    ],
  },
  {
    id: "clinic-5",
    name: "Sunrise Wellness Clinic",
    address: "53 HSR Layout Sector 2",
    city: "Bangalore",
    distance: "4.0 km",
    rating: 4.7,
    reviewCount: 143,
    phone: "+91 98765 44444",
    specializations: ["General Physician", "Gynecologist"],
    doctors: [
      {
        id: "doc-8",
        name: "Dr. Meera Joshi",
        department: "Gynecology",
        specialization: "Gynecologist",
        nextAvailable: "Today, 11:30 AM",
        slots: generateSlots([0, 2, 4, 7, 10, 12, 13]),
      },
    ],
  },
];
