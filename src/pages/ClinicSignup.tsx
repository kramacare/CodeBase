import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/auth/AuthCard";
import { Building2, Mail, Lock, Phone, MapPin, Plus, X, User, ArrowRight } from "lucide-react";

const ClinicSignup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    clinic_name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    address: "",
    doctor_name: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted with data:", form);
    
    if (!form.clinic_name || !form.email || !form.password || !form.phone || !form.address) {
      console.log("Validation failed - missing required fields");
      return setError("Please fill all required fields.");
    }
    
    if (form.password !== form.confirm) {
      console.log("Password mismatch");
      return setError("Passwords do not match.");
    }
    
    console.log("Validation passed, sending request...");
    setError("");
    setLoading(true);

    try {
      console.log("Sending request to:", "http://localhost:8000/auth/clinic/signup");
      console.log("Request body:", {
        clinic_name: form.clinic_name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        doctor_name: form.doctor_name
      });
      
      const response = await fetch("http://localhost:8000/auth/clinic/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinic_name: form.clinic_name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          address: form.address,
          doctor_name: form.doctor_name
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Signup failed");
        return;
      }

      // Navigate to success page with registration data
      const registrationData = {
        clinic_name: form.clinic_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        doctor_name: form.doctor_name
      };

      // Navigate to success page with registration data
      navigate("/clinic/register/success", { state: { data: registrationData } });
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="clinic_name">Clinic Name</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
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
              <Label htmlFor="phone">Phone Number</Label>
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
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="address">Clinic Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Street address, building number, city, state, PIN code"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Doctor Name Section */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="doctor_name">Doctor Name (Optional)</Label>
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
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
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={(e) => update("confirm", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Clinic Account"} 
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
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
