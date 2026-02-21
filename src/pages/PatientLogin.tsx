import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/auth/AuthCard";

import { Activity, Phone, Mail, Lock, ArrowRight } from "lucide-react";

const PatientLogin = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }

    if (mode === "password" && !password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setError("");

    // ✅ Correct navigation
    navigate("/patient");
  };

  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* LEFT BRANDING PANEL */}
        <div className="hidden flex-1 items-center justify-center bg-primary/5 lg:flex">
          <div className="max-w-sm text-center">
            <Activity className="mx-auto h-16 w-16 text-primary" />
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              QueueSmart
            </h2>
            <p className="mt-3 text-muted-foreground">
              Skip the wait. Book clinic appointments and track your queue in
              real time.
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <AuthCard>
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-2xl font-bold text-foreground">
                Patient Login
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Welcome back! Sign in to manage your appointments.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Phone Number / Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {mode === "password" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full">
                {mode === "otp" ? "Send OTP" : "Login"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() =>
                  setMode(mode === "password" ? "otp" : "password")
                }
                className="text-sm text-primary hover:underline"
              >
                {mode === "password" ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    Login with OTP
                  </span>
                ) : (
                  "Login with Password"
                )}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New user?{" "}
              <Link
                to="/patient/signup"
                className="font-medium text-primary hover:underline"
              >
                Create account
              </Link>
            </p>
          </AuthCard>
        </div>
      </div>
    </>
  );
};

export default PatientLogin;
