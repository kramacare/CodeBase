import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePatient } from "@/context/PatientContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, Phone, Lock, Trash2, User, LogOut } from "lucide-react";

const PatientProfile = () => {
  const navigate = useNavigate();
  const { profile, updatePhone, updatePassword } = usePatient();
  const [phone, setPhone] = useState(profile.phone);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleLogout = () => {
    // Clear all patient data
    localStorage.removeItem("queuesmart_patient_profile");
    localStorage.removeItem("queuesmart_active_appointment");
    localStorage.removeItem("queuesmart_visit_history");
    navigate("/");
  };

  const handleSavePhone = () => {
    updatePhone(phone);
    alert("Phone number updated successfully!");
  };

  const handleSavePassword = () => {
    if (newPassword && newPassword === confirmPassword) {
      updatePassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      alert("Password updated successfully!");
    } else {
      alert("Passwords do not match!");
    }
  };

  const handleDeleteAccount = () => {
    // Clear all patient data
    localStorage.removeItem("queuesmart_patient_profile");
    localStorage.removeItem("queuesmart_active_appointment");
    localStorage.removeItem("queuesmart_visit_history");
    setDeleteDialogOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link
            to="/patient"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <span className="font-semibold text-foreground">Profile Settings</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Profile Info */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00555A] text-white">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Change Phone Number */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-[#00555A]" />
            <h3 className="text-lg font-semibold text-foreground">Change Phone Number</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button onClick={handleSavePhone} className="w-full sm:w-auto">
              Save Phone Number
            </Button>
          </div>
        </div>

        {/* Change Password */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-[#00555A]" />
            <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-pw">New Password</Label>
              <Input
                id="new-pw"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm Password</Label>
              <Input
                id="confirm-pw"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSavePassword}
              disabled={!newPassword || newPassword !== confirmPassword}
              className="w-full sm:w-auto"
            >
              Save Password
            </Button>
          </div>
        </div>

        {/* Logout */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="h-5 w-5 text-[#00555A]" />
            <h3 className="text-lg font-semibold text-foreground">Logout</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sign out of your account and return to home page.
          </p>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            Logout
          </Button>
        </div>

        {/* Delete Account */}
        <div className="rounded-xl border border-destructive/50 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground">Delete Account</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, all your data will be permanently removed. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            Delete Account
          </Button>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This will permanently remove all your data including appointments and reviews.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientProfile;
