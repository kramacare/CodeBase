import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/auth/AuthCard";
import Layout from "@/components/layout/Layout";
import { pageLoadVariants } from "@/lib/animations";

import { Activity, Mail, Lock, ArrowRight } from "lucide-react";

const PatientLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/patient/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Login failed");
        return;
      }

      const userData = {
        id: data.user_id,
        type: data.user_type,
        email: email,
        name: data.patient_data?.name || email.split('@')[0],
        patient_id: data.patient_data?.patient_id || null
      };
      localStorage.setItem("user", JSON.stringify(userData));

      navigate("/patient");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <motion.div 
        variants={pageLoadVariants}
        initial="hidden"
        animate="visible"
        className="flex min-h-[calc(100vh-64px)]"
      >
        {/* LEFT BRANDING PANEL */}
        <motion.div 
          variants={pageLoadVariants}
          className="hidden lg:flex flex-1 items-center justify-center bg-primary/5"
        >
          <div className="max-w-sm text-center">
            <Activity className="mx-auto h-16 w-16 text-primary" />
            <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Krama
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Skip the wait. Book clinic appointments and track your queue in real time.
            </p>
          </div>
        </motion.div>

        {/* RIGHT LOGIN FORM */}
        <motion.div 
          variants={pageLoadVariants}
          className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12"
        >
          <AuthCard>
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                Patient Login
              </h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
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
                <Label htmlFor="email">Email</Label>
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/patient/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

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
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default PatientLogin;
