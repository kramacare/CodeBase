import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/auth/AuthCard";

import { Building2, Lock, ArrowRight } from "lucide-react";

const ClinicLogin = () => {
  const navigate = useNavigate();

  const [clinicId, setClinicId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clinicId.trim() || !password.trim()) {
      setError("Please fill all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/clinic/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: clinicId,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Login failed");
        return;
      }

      // Store user info in localStorage
      localStorage.setItem("user", JSON.stringify({
        id: data.user_id,
        type: data.user_type,
        email: clinicId
      }));

      // 🚀 Redirect to clinic dashboard immediately
      navigate("/clinic");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-secondary/30 px-4 py-12">
        <AuthCard>
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Clinic Staff Login
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Access your clinic's queue management dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="clinicId">Clinic ID / Email</Label>
              <Input
                id="clinicId"
                placeholder="clinic@example.com"
                value={clinicId}
                onChange={(e) => setClinicId(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
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
              {loading ? "Logging in..." : "Login"} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New clinic?{" "}
            <Link
              to="/clinic/register"
              className="font-medium text-primary hover:underline"
            >
              Register your clinic
            </Link>
          </p>
        </AuthCard>
      </div>
    </>
  );
};

export default ClinicLogin;
