import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import { CheckCircle2, Mail, ArrowLeft, Building2, User, Stethoscope, MapPin, Phone } from "lucide-react";

interface RegistrationData {
  clinicName: string;
  doctorName: string;
  specialization: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

const ClinicRegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Get registration data from location state
    if (location.state?.data) {
      setRegistrationData(location.state.data);
      sendRegistrationEmail(location.state.data);
    } else {
      // If no data, redirect to registration
      navigate("/clinic/register");
    }
  }, [location.state, navigate]);

  const sendRegistrationEmail = async (data: RegistrationData) => {
    try {
      // In a real application, you would send this to your backend
      // For now, we'll simulate the email sending
      const emailContent = `
        New Clinic Registration Details:
        
        Clinic Name: ${data.clinicName}
        Doctor Name: ${data.doctorName}
        Specialization: ${data.specialization}
        Address: ${data.address}, ${data.city}
        Phone: ${data.phone}
        Email: ${data.email}
        
        Registration Date: ${new Date().toLocaleDateString()}
      `;

      // Simulate API call to send email
      console.log("Sending email with content:", emailContent);
      
      // In production, you would make an API call like:
      // await fetch('/api/send-registration-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ data, emailContent })
      // });

      setEmailSent(true);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  if (!registrationData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <AuthCard className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Registration Successful!
          </h1>
          <p className="text-muted-foreground">
            Your clinic has been successfully registered with Krama.
          </p>
          {emailSent && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-full">
              <Mail className="w-4 h-4" />
              Registration details have been sent to your email
            </div>
          )}
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
                <p className="font-medium">{registrationData.clinicName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Doctor Name</label>
                <p className="font-medium flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {registrationData.doctorName}
                </p>
              </div>
            </div>

            {registrationData.specialization && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Specialization</label>
                <p className="font-medium flex items-center gap-1">
                  <Stethoscope className="w-4 h-4" />
                  {registrationData.specialization}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {registrationData.address && `${registrationData.address}, `}{registrationData.city}
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
          <Button asChild className="flex-1">
            <Link to="/clinic/login">
              Go to Login
              <ArrowLeft className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
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
