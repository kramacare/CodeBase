import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Mail, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState<{text: string; type: "success" | "error"} | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    // Get email from location state or localStorage
    const storedEmail = localStorage.getItem("pending_verification_email");
    if (location.state?.email) {
      setEmail(location.state.email);
      localStorage.setItem("pending_verification_email", location.state.email);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email - redirect to signup
      navigate("/patient/signup");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Countdown timer for resend button
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
      const response = await fetch("http://localhost:8000/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp_code: otp,
        }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setSuccess(true);
        // Clear pending verification
        localStorage.removeItem("pending_verification_email");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/patient/login");
        }, 2000);
      } else {
        setError(data.detail || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setError("");
    setResendLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(60); // 60 seconds cooldown
        setOtp("");
        setError("");
        setMessage({text: "OTP sent successfully!", type: "success"});
      } else {
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Verified!</h2>
              <p className="text-muted-foreground mb-4">
                Your email has been verified successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit OTP to
              </p>
              <p className="font-medium text-foreground">{email}</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the OTP?
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={resendLoading || countdown > 0}
                className="text-primary hover:text-primary/80"
              >
                {countdown > 0 ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Resend in {countdown}s
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Resend OTP
                  </span>
                )}
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/patient/signup")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Signup
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;
