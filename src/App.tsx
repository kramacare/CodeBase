import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import NoHeaderLayout from "./layouts/NoHeaderLayout";
import { QueueProvider } from "./context/QueueContext";
import { PatientProvider } from "./context/PatientContext";

import Index from "./pages/Index";
import PatientDashboard from "./pages/PatientDashboard";
import PatientFindClinics from "./pages/PatientFindClinics";
import PatientReviews from "./pages/PatientReviews";
import PatientWriteReview from "./pages/PatientWriteReview";
import PatientProfile from "./pages/PatientProfile";
import ClinicDashboard from "./pages/ClinicDashboard";
import ClinicControlQueue from "./pages/ClinicControlQueue";
import ClinicManageTime from "./pages/ClinicManageTime";
import ClinicProfile from "./pages/ClinicProfile";
import ClinicDetails from "./pages/ClinicDetails";
import BookAppointment from "./pages/BookAppointment";
import AppointmentConfirmation from "./pages/AppointmentConfirmation";
import JoinQueue from "./pages/JoinQueue";
import LiveQueue from "./pages/LiveQueue";
import PatientLogin from "./pages/PatientLogin";
import PatientSignup from "./pages/PatientSignup";
import OTPVerification from "./pages/OTPVerification";
import PatientForgotPassword from "./pages/PatientForgotPassword";
import PatientVerifyResetOTP from "./pages/PatientVerifyResetOTP";
import PatientResetPassword from "./pages/PatientResetPassword";
import ClinicLogin from "./pages/ClinicLogin";
import ClinicSignup from "./pages/ClinicSignup";
import ClinicRegistrationSuccess from "./pages/ClinicRegistrationSuccess";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";
import TrackQueue from "./pages/TrackQueue";


function App() {
  return (
    <QueueProvider>
      <PatientProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes with Header */}
            <Route path="/" element={<MainLayout><Index /></MainLayout>} />
            <Route path="/about" element={<MainLayout><AboutUs /></MainLayout>} />

            {/* Patient Auth with Header */}
            <Route path="/patient/login" element={<MainLayout><PatientLogin /></MainLayout>} />
            <Route path="/patient/signup" element={<MainLayout><PatientSignup /></MainLayout>} />
            <Route path="/patient/verify-otp" element={<MainLayout><OTPVerification /></MainLayout>} />
            <Route path="/patient/forgot-password" element={<MainLayout><PatientForgotPassword /></MainLayout>} />
            <Route path="/patient/verify-reset-otp" element={<MainLayout><PatientVerifyResetOTP /></MainLayout>} />
            <Route path="/patient/reset-password" element={<MainLayout><PatientResetPassword /></MainLayout>} />

            {/* Clinic Auth with Header */}
            <Route path="/clinic/login" element={<MainLayout><ClinicLogin /></MainLayout>} />
            <Route path="/clinic/register" element={<MainLayout><ClinicSignup /></MainLayout>} />
            <Route path="/clinic/register/success" element={<MainLayout><ClinicRegistrationSuccess /></MainLayout>} />

            {/* Patient Area without Header */}
            <Route path="/patient" element={<NoHeaderLayout><PatientDashboard /></NoHeaderLayout>} />
            <Route path="/patient/find-clinics" element={<NoHeaderLayout><PatientFindClinics /></NoHeaderLayout>} />
            <Route path="/patient/reviews" element={<NoHeaderLayout><PatientReviews /></NoHeaderLayout>} />
            <Route path="/patient/reviews/:visitId" element={<NoHeaderLayout><PatientWriteReview /></NoHeaderLayout>} />
            <Route path="/patient/profile" element={<NoHeaderLayout><PatientProfile /></NoHeaderLayout>} />
            <Route path="/clinic-details/:id" element={<NoHeaderLayout><ClinicDetails /></NoHeaderLayout>} />
            <Route path="/book/:clinicId/:doctorId" element={<NoHeaderLayout><BookAppointment /></NoHeaderLayout>} />
            <Route path="/confirmation" element={<NoHeaderLayout><AppointmentConfirmation /></NoHeaderLayout>} />

            {/* Queue System without Header */}
            <Route path="/join" element={<NoHeaderLayout><JoinQueue /></NoHeaderLayout>} />
            <Route path="/live" element={<NoHeaderLayout><LiveQueue /></NoHeaderLayout>} />
            <Route path="/track" element={<NoHeaderLayout><TrackQueue /></NoHeaderLayout>} />

            {/* Clinic Area without Header */}
            <Route path="/clinic" element={<NoHeaderLayout><ClinicDashboard /></NoHeaderLayout>} />
            <Route path="/clinic/control-queue" element={<NoHeaderLayout><ClinicControlQueue /></NoHeaderLayout>} />
            <Route path="/clinic/manage-time" element={<NoHeaderLayout><ClinicManageTime /></NoHeaderLayout>} />
            <Route path="/clinic/profile" element={<NoHeaderLayout><ClinicProfile /></NoHeaderLayout>} />

            {/* 404 with Header */}
            <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
          </Routes>
        </BrowserRouter>
      </PatientProvider>
    </QueueProvider>
  );
}

export default App;
