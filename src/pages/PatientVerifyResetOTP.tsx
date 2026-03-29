import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/auth/AuthCard";
import { Activity, Mail, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";

const PatientVerifyResetOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Get email from sessionStorage
  const email = sessionStorage.getItem("reset_email") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/patient/verify-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Invalid OTP");
        return;
      }

      setMessage("OTP verified successfully!");
      // Store reset token in sessionStorage
      sessionStorage.setItem("reset_token", data.reset_token);
      
      // Navigate to reset password after 1 second
      setTimeout(() => {
        navigate("/patient/reset-password");
      }, 1000);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      const response = await fetch("http://localhost:8000/auth/patient/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Failed to resend OTP");
        return;
      }

      setMessage("New OTP sent to your email.");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* LEFT BRANDING PANEL */}
        <div className="hidden flex-1 items-center justify-center bg-primary/5 lg:flex">
          <div className="max-w-sm text-center">
            <Activity className="mx-auto h-16 w-16 text-primary" />
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              Krama
            </h2>
            <p className="mt-3 text-muted-foreground">
              Skip the wait. Book clinic appointments and track your queue in real time.
            </p>
          </div>
        </div>

        {/* RIGHT OTP VERIFICATION FORM */}
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <AuthCard>
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-2xl font-bold text-foreground">
                Verify OTP
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the 6-digit OTP sent to {email}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <RefreshCw className="mr-1 h-4 w-4 inline animate-spin" />
                    Resending OTP...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1 h-4 w-4 inline" />
                    Resend OTP
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/patient/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </AuthCard>
        </div>
      </div>
    </>
  );
};

export default PatientVerifyResetOTP;
