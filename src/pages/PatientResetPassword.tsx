import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/auth/AuthCard";
import { Activity, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react";

const PatientResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Get email from sessionStorage
  const email = sessionStorage.getItem("reset_email") || "";

  // Password strength indicators
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const checkPasswordStrength = (password: string) => {
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    });
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    checkPasswordStrength(value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check password strength
    if (!Object.values(passwordChecks).every(check => check)) {
      setError("Password does not meet all requirements.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/patient/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Failed to reset password");
        return;
      }

      setMessage("Password reset successfully!");
      
      // Clear sessionStorage
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_token");
      
      // Navigate to login after 2 seconds
      setTimeout(() => {
        navigate("/patient/login");
      }, 2000);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = Object.values(passwordChecks).every(check => check);

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

        {/* RIGHT RESET PASSWORD FORM */}
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <AuthCard>
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-2xl font-bold text-foreground">
                Reset Password
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a new password for your account
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
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicators */}
              {newPassword && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Password must contain:</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      {passwordChecks.length ? (
                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      At least 8 characters
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordChecks.uppercase ? (
                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      One uppercase letter (A-Z)
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordChecks.lowercase ? (
                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      One lowercase letter (a-z)
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordChecks.number ? (
                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      One number (0-9)
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordChecks.special ? (
                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      One special character (!@#$%^&*...)
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    className="pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !isPasswordValid || newPassword !== confirmPassword}
              >
                {loading ? "Resetting..." : "Reset Password"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

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

export default PatientResetPassword;
