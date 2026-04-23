import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import { 
  Clock, 
  Mail, 
  ArrowLeft, 
  Building2, 
  User, 
  MapPin, 
  Phone,
  Hourglass,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface RegistrationData {
  clinic_name: string;
  doctor_name: string;
  address: string;
  phone: string;
  email: string;
}

const ClinicRegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  useEffect(() => {
    // Get registration data from location state
    if (location.state?.data) {
      setRegistrationData(location.state.data);
    } else {
      // If no data, redirect to registration
      navigate("/clinic/register");
    }
  }, [location.state, navigate]);

  if (!registrationData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <AuthCard className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Hourglass className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Registration Received!
          </h1>
          <p className="text-muted-foreground">
            Your application is under review and awaiting approval.
          </p>
        </div>

        {/* Pending Approval Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">Pending Admin Approval</h3>
              <p className="text-sm text-amber-700">
                Your registration has been submitted and is currently being reviewed by our admin team. 
                You will receive an email response within <strong>24 hours</strong> regarding the status of your application.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Important Notice</h3>
              <p className="text-sm text-blue-700">
                <strong>You cannot log in until your registration has been approved.</strong> Once approved, you will receive an email with your Clinic ID and login instructions.
              </p>
            </div>
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-3 rounded-full mb-6 w-full justify-center">
          <Mail className="w-4 h-4" />
          <span>A confirmation email has been sent to <strong>{registrationData.email}</strong></span>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Registration Details
          </h2>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Clinic Name</label>
                <p className="font-medium">{registrationData.clinic_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Doctor Name</label>
                <p className="font-medium flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {registrationData.doctor_name || "Not specified"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {registrationData.address}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="font-medium flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {registrationData.phone}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="font-medium">{registrationData.email}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" asChild className="flex-1">
            <Link to="/clinic/login">
              Go to Login
              <ArrowLeft className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </AuthCard>
    </div>
  );
};

export default ClinicRegistrationSuccess;
