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
    address: ""
  });
  const [doctors, setDoctors] = useState([{ name: "", specialization: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const addDoctor = () => {
    setDoctors([...doctors, { name: "", specialization: "" }]);
  };

  const removeDoctor = (index: number) => {
    const newDoctors = doctors.filter((_, i) => i !== index);
    setDoctors(newDoctors);
  };

  const updateDoctor = (index: number, field: string, value: string) => {
    const newDoctors = [...doctors];
    newDoctors[index] = { ...newDoctors[index], [field]: value };
    setDoctors(newDoctors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.clinic_name || !form.email || !form.password || !form.phone || !form.address) {
      return setError("Please fill all required fields.");
    }
    
    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }

    // Validate at least one doctor is filled
    const validDoctors = doctors.filter(doc => doc.name.trim() && doc.specialization.trim());
    if (validDoctors.length === 0) {
      return setError("Please add at least one doctor with name and specialization.");
    }
    
    setError("");
    setLoading(true);

    try {
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
          doctors: validDoctors
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Signup failed");
        return;
      }

      // Store registration data for success page
      const registrationData = {
        clinicName: form.clinic_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        doctors: validDoctors
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

            <div className="space-y-1.5">
              <Label htmlFor="address">Clinic Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="123 Main Street, City, State"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Doctors Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Doctors</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDoctor}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Doctor
                </Button>
              </div>

              {doctors.map((doctor, index) => (
                <div key={index} className="grid gap-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Doctor {index + 1}</span>
                    </div>
                    {doctors.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDoctor(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`doctor-name-${index}`}>Doctor Name</Label>
                      <Input
                        id={`doctor-name-${index}`}
                        placeholder="Dr. John Smith"
                        value={doctor.name}
                        onChange={(e) => updateDoctor(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`doctor-spec-${index}`}>Specialization</Label>
                      <Input
                        id={`doctor-spec-${index}`}
                        placeholder="Cardiology, General Practice, etc."
                        value={doctor.specialization}
                        onChange={(e) => updateDoctor(index, "specialization", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
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
