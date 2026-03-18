import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/auth/AuthCard";
import { Building2, User, Stethoscope, MapPin, Phone, Mail, Lock, ArrowRight } from "lucide-react";

const ClinicRegistration = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    clinicName: "", doctorName: "", specialization: "", address: "", city: "", phone: "", email: "", password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["clinicName", "doctorName", "email", "password"];
    if (required.some((k) => !form[k as keyof typeof form].trim()))
      return setError("Please fill all required fields.");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8001/auth/clinic/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinic_name: form.clinicName,
          email: form.email,
          password: form.password,
          phone: form.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Registration failed");
        return;
      }

      // ✅ Navigate to success page immediately after successful signup
      const { password, ...dataToSend } = form;
      navigate("/clinic/register/success", { 
        state: { data: dataToSend } 
      });
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (id: string, label: string, icon: React.ReactNode, placeholder: string, type = "text") => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={form[id as keyof typeof form]}
          onChange={(e) => update(id, e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-secondary/30 px-4 py-12">
      <AuthCard className="max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Register Your Clinic</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join Krama and bring smart queue management to your practice.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("clinicName", "Clinic Name *", <Building2 className="h-4 w-4" />, "CityCare Clinic")}
            {field("doctorName", "Doctor Name *", <User className="h-4 w-4" />, "Dr. Sharma")}
          </div>
          {field("specialization", "Specialization", <Stethoscope className="h-4 w-4" />, "General Physician")}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("address", "Address", <MapPin className="h-4 w-4" />, "42 MG Road")}
            {field("city", "City", <MapPin className="h-4 w-4" />, "Bangalore")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("phone", "Phone Number", <Phone className="h-4 w-4" />, "+91 98765 43210")}
            {field("email", "Email *", <Mail className="h-4 w-4" />, "clinic@example.com", "email")}
          </div>
          {field("password", "Password *", <Lock className="h-4 w-4" />, "••••••••", "password")}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering Clinic..." : "Register Clinic"} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/clinic/login" className="font-medium text-primary hover:underline">Login</Link>
        </p>
      </AuthCard>
    </div>
    </>
  );
};

export default ClinicRegistration;
