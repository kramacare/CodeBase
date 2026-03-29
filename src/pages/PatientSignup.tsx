import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/auth/AuthCard";
import { User, Phone, Mail, Lock, ArrowRight, Check, X } from "lucide-react";

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

const PatientSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    setPasswordValid(validatePassword(form.password));
  }, [form.password]);

  const allValid = Object.values(passwordValid).every(Boolean);
  const isSubmitDisabled = !allValid || form.password !== form.confirm || !form.name || !form.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return setError("Please fill all required fields.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (!allValid) return setError("Please meet all password requirements.");
    
    setError("");
    setLoading(true);

    try {
      // Directly send OTP with user data - backend will check if email exists
      const otpResponse = await fetch("http://localhost:8000/auth/register/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
        }),
      });

      const otpData = await otpResponse.json();

      if (!otpResponse.ok) {
        setError(otpData.detail || "Failed to send OTP");
        setLoading(false);
        return;
      }

      // Store email for OTP verification
      localStorage.setItem("pending_verification_email", form.email);
      
      // Move to OTP step
      setStep("otp");
    } catch (err) {
      setError("Network error. Please try again. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <OTPVerificationPage 
        email={form.email}
        onBack={() => setStep("form")}
      />
    );
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-secondary/30 px-4 py-12">
      <AuthCard className="max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Create Patient Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Book clinic appointments without waiting in queues.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" placeholder="John Doe" value={form.name} onChange={(e) => update("name", e.target.value)} className="pl-9" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="pl-9" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => update("password", e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="confirm" type="password" placeholder="••••••••" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} className="pl-9" />
              </div>
            </div>
          </div>

          {form.password && (
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium mb-2">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-1">
                <Requirement met={passwordValid.length} label="At least 8 characters" />
                <Requirement met={passwordValid.uppercase} label="One uppercase (A-Z)" />
                <Requirement met={passwordValid.lowercase} label="One lowercase (a-z)" />
                <Requirement met={passwordValid.number} label="One number (0-9)" />
                <Requirement met={passwordValid.special} label="One special (!@#$...)" />
              </div>
            </div>
          )}

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <strong>Note:</strong> An OTP will be sent to your email for verification before account creation.
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending OTP..." : "Continue with OTP Verification"} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/patient/login" className="font-medium text-primary hover:underline">Login</Link>
        </p>
      </AuthCard>
    </div>
    </>
  );
};

// OTP Verification Page Component
const OTPVerificationPage = ({ email, onBack }: { 
  email: string, 
  onBack: () => void
}) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      // Verify OTP - this will create the patient account automatically
      const verifyResponse = await fetch("http://localhost:8000/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp_code: otp,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.verified) {
        setError(verifyData.detail || "Invalid OTP. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      const response = await fetch("http://localhost:8000/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setCountdown(60);
        setOtp("");
        setError("");
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-secondary/30 px-4 py-12">
        <AuthCard className="max-w-lg">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Account Created!</h2>
            <p className="text-muted-foreground mb-6">Your patient account has been successfully created.</p>
            <Button onClick={() => navigate("/patient/login")} className="w-full">
              Go to Patient Login <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-secondary/30 px-4 py-12">
      <AuthCard className="max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Verify Your Email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the OTP sent to {email}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="otp">OTP Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Verify & Create Account"}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={resendLoading || countdown > 0}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Signup
            </Button>
          </div>
        </form>
      </AuthCard>
    </div>
  );
};

export default PatientSignup;
