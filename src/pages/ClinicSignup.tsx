import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/auth/AuthCard";
import { Building2, Mail, Lock, Phone, MapPin, Plus, X, User, ArrowRight, Stethoscope, Award, Calendar, Check } from "lucide-react";

const validatePassword = (password: string) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
});

const Requirement = ({ met, label }: { met: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    {met ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    )}
    <span className={met ? "text-green-700" : "text-muted-foreground"}>{label}</span>
  </div>
);

// Clinic categories with icons
const clinicCategories = [
  { id: "general", name: "General", icon: "🩺", description: "General health, fever, cold" },
  { id: "skin", name: "Skin", icon: "🔬", description: "Skin problems, allergies" },
  { id: "dental", name: "Dental", icon: "🦷", description: "Teeth, gums, oral care" },
  { id: "bone", name: "Bone & Joint", icon: "🦴", description: "Orthopedic, fractures, joint pain" },
  { id: "eye", name: "Eye", icon: "👁️", description: "Vision, glasses, eye care" },
  { id: "ent", name: "ENT", icon: "👂", description: "Ear, nose, throat" },
  { id: "heart", name: "Cardiology", icon: "❤️", description: "Heart-related issues" },
  { id: "neuro", name: "Neurology", icon: "🧠", description: "Brain, nerves, spine" },
  { id: "child", name: "Pediatric", icon: "👶", description: "Child care, vaccination" },
  { id: "women", name: "Gynecology", icon: "🌸", description: "Women's health" },
  { id: "mental", name: "Mental Health", icon: "🧘", description: "Psychiatry, counseling" },
  { id: "physio", name: "Physiotherapy", icon: "💪", description: "Physical therapy, rehab" },
  { id: "vet", name: "Pet Hospital", icon: "🐕", description: "Pet care, veterinary" },
  { id: "scanning", name: "Scanning Center", icon: "📷", description: "X-ray, MRI, CT scan" },
  { id: "lab", name: "Diagnostic Lab", icon: "🧪", description: "Blood tests, diagnostics" },
  { id: "ayurveda", name: "Ayurveda", icon: "🌿", description: "Ayurvedic treatment" },
  { id: "homeo", name: "Homeopathy", icon: "💊", description: "Homeopathic treatment" },
  { id: "other", name: "Other", icon: "🏥", description: "Other specializations" }
];

const ClinicSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    // Clinic Details
    clinic_name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    category: "",
    address: "",
    road: "",
    city: "",
    pincode: "",
    layout: "",
    section: "",
    // Doctor Details
    doctor_name: "",
    specialization: "",
    experience: "",
    qualifications: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string; type: "success" | "error"} | null>(null);
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  
  // OTP verification state
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    setPasswordValid(validatePassword(form.password));
  }, [form.password]);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Send OTP to email
  const handleSendOTP = async () => {
    if (!form.email) {
      setError("Please enter your email address");
      return;
    }
    
    const allValid = Object.values(passwordValid).every(Boolean);
    if (!allValid) {
      setError("Please meet all password requirements");
      return;
    }
    
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!form.clinic_name || !form.phone || !form.category || !form.address || !form.road || !form.city || !form.pincode) {
      setError("Please fill all required fields");
      return;
    }

    setError("");
    setOtpLoading(true);

    const fullAddress = [
      form.address, form.road, form.layout, form.section, form.city, form.pincode
    ].filter(Boolean).join(", ");

    try {
      const response = await fetch("http://localhost:8000/auth/clinic/send-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          clinic_name: form.clinic_name,
          password: form.password,
          phone: form.phone,
          category: form.category,
          address: fullAddress,
          street_address: form.address,
          road: form.road,
          layout: form.layout,
          section: form.section,
          city: form.city,
          pincode: form.pincode,
          doctor_name: form.doctor_name,
          specialization: form.specialization,
          experience: form.experience,
          qualifications: form.qualifications
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      setShowOTPInput(true);
      setMessage({ text: "OTP sent to your email!", type: "success" });
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP and complete registration
  const handleVerifyAndRegister = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    const fullAddress = [
      form.address, form.road, form.layout, form.section, form.city, form.pincode
    ].filter(Boolean).join(", ");

    try {
      const response = await fetch("http://localhost:8000/auth/clinic/verify-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          otp: otp,
          clinic_name: form.clinic_name,
          password: form.password,
          phone: form.phone,
          category: form.category,
          address: fullAddress,
          street_address: form.address,
          road: form.road,
          layout: form.layout,
          section: form.section,
          city: form.city,
          pincode: form.pincode,
          doctor_name: form.doctor_name,
          specialization: form.specialization,
          experience: form.experience,
          qualifications: form.qualifications
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Verification failed");
        return;
      }

      navigate("/clinic/register/success", { 
        state: { 
          data: {
            clinic_name: form.clinic_name,
            email: form.email,
            phone: form.phone,
            address: fullAddress,
            doctor_name: form.doctor_name
          }
        } 
      });
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    if (!form.clinic_name || !form.email || !form.password || !form.phone || !form.category) {
      setError("Please fill all required clinic details including category.");
      return false;
    }
    if (!form.address || !form.road || !form.city || !form.pincode) {
      setError("Please fill all required address details.");
      return false;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setError("");
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError("");
  };

  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-secondary/30 px-4 py-12">
        <AuthCard className="max-w-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">Register Your Clinic</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Join Krama to manage your clinic's queue efficiently.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {message && (
            <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message.text}
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${currentStep === 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
              <span className="font-medium">1</span>
              <span>Clinic Details</span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${currentStep === 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
              <span className="font-medium">2</span>
              <span>Doctor Details</span>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {currentStep === 1 ? (
              <>
                {/* Step 1: Clinic Details */}
                <div className="space-y-1.5">
                  <Label htmlFor="clinic_name">Clinic Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="clinic_name"
                      placeholder="City Medical Center"
                      value={form.clinic_name}
                      onChange={(e) => update("clinic_name", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Clinic Category Selection */}
                <div className="space-y-2">
                  <Label>Clinic Category *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {clinicCategories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => update("category", cat.id)}
                        className={`p-2 rounded-md cursor-pointer transition-all ${
                          form.category === cat.id 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-muted/50 hover:bg-muted border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span>
                          <div className="text-left">
                            <div className="text-sm font-medium">{cat.name}</div>
                            <div className={`text-xs ${form.category === cat.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                              {cat.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="clinic@example.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    Clinic Address Details
                  </div>

                  {/* Street/Building Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="address">Street / Building Number *</Label>
                    <Input
                      id="address"
                      placeholder="#123, ABC Building"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                    />
                  </div>

                  {/* Road */}
                  <div className="space-y-1.5">
                    <Label htmlFor="road">Road / Street Name *</Label>
                    <Input
                      id="road"
                      placeholder="Main Road, MG Road"
                      value={form.road}
                      onChange={(e) => update("road", e.target.value)}
                    />
                  </div>

                  {/* Layout & Section - 2 columns */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="layout">Layout / Area (Optional)</Label>
                      <Input
                        id="layout"
                        placeholder="Vidyanaranyapura, Yelahanka"
                        value={form.layout}
                        onChange={(e) => update("layout", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="section">Section / Block (Optional)</Label>
                      <Input
                        id="section"
                        placeholder="A Block, 1st Stage"
                        value={form.section}
                        onChange={(e) => update("section", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* City & Pincode - 2 columns */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="Bangalore"
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        placeholder="560001"
                        value={form.pincode}
                        onChange={(e) => update("pincode", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Password Requirements */}
                  {form.password && (
                    <div className="rounded-lg border p-3 text-sm">
                      <p className="font-medium mb-2">Password Requirements:</p>
                      <div className="grid grid-cols-2 gap-1">
                        <Requirement met={passwordValid.length} label="At least 8 characters" />
                        <Requirement met={passwordValid.uppercase} label="One uppercase (A-Z)" />
                        <Requirement met={passwordValid.lowercase} label="One lowercase (a-z)" />
                        <Requirement met={passwordValid.number} label="One number (0-9)" />
                        <Requirement met={passwordValid.special} label="One special character" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={form.confirm}
                        onChange={(e) => update("confirm", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* OTP Input - shown after OTP is sent */}
                  {showOTPInput && (
                    <div className="space-y-1.5 border-t pt-4 mt-4">
                      <Label htmlFor="otp">Enter OTP sent to your email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="pl-9"
                          maxLength={6}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        OTP sent to {form.email}. Check your inbox.
                      </p>
                    </div>
                  )}
                </div>

                <Button type="button" onClick={handleNext} className="w-full">
                  Next: Doctor Details <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                {/* Step 2: Doctor Details */}
                <div className="space-y-1.5">
                  <Label htmlFor="doctor_name">Doctor Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="doctor_name"
                      placeholder="Dr. John Smith"
                      value={form.doctor_name}
                      onChange={(e) => update("doctor_name", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="specialization">Specialization</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="specialization"
                      placeholder="Cardiologist, Dermatologist, etc."
                      value={form.specialization}
                      onChange={(e) => update("specialization", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="experience"
                      type="number"
                      placeholder="5"
                      value={form.experience}
                      onChange={(e) => update("experience", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="qualifications"
                      placeholder="MBBS, MD, MS, etc."
                      value={form.qualifications}
                      onChange={(e) => update("qualifications", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                  {showOTPInput ? (
                    <Button 
                      type="button" 
                      className="flex-1" 
                      disabled={loading || otpLoading}
                      onClick={handleVerifyAndRegister}
                    >
                      {loading ? "Verifying..." : "Verify OTP & Register"}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      className="flex-1" 
                      disabled={otpLoading}
                      onClick={handleSendOTP}
                    >
                      {otpLoading ? "Sending OTP..." : "Send OTP to Verify"}
                      <Mail className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/clinic/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        </AuthCard>
      </div>
    </>
  );
};

export default ClinicSignup;
