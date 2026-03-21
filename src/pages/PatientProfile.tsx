import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePatient } from "@/context/PatientContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, Lock, Trash2, User, LogOut } from "lucide-react";

const PatientProfile = () => {
  const navigate = useNavigate();
  const { profile } = usePatient();
  const [dbProfile, setDbProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get the actual logged-in user's email from localStorage
  const getLoggedInEmail = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.email;
      }
    } catch (error) {
      console.error("Error getting user from localStorage:", error);
    }
    return null;
  };
  
  const loggedInEmail = getLoggedInEmail();
  
  // Form states
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch patient data from database using actual logged-in email
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!loggedInEmail) {
        console.error("No logged-in user found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/auth/patient/data?email=${loggedInEmail}`);
        if (response.ok) {
          const data = await response.json();
          setDbProfile(data);
          setPhone(data.phone || "");
        } else {
          console.error("Failed to fetch patient data:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [loggedInEmail]);

  const handleLogout = () => {
    localStorage.removeItem("krama_patient_profile");
    localStorage.removeItem("krama_active_appointment");
    localStorage.removeItem("krama_visit_history");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleChangePhone = async () => {
    if (!loggedInEmail) {
      alert("No logged-in user found");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/patient/change-phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_phone: phone,
          patient_email: loggedInEmail
        })
      });

      if (response.ok) {
        alert("Phone number updated successfully!");
        // Refresh data to show updated phone
        const fetchUpdatedData = async () => {
          try {
            const dataResponse = await fetch(`http://localhost:8000/auth/patient/data?email=${loggedInEmail}`);
            if (dataResponse.ok) {
              const data = await dataResponse.json();
              setDbProfile(data);
              setPhone(data.phone || "");
            }
          } catch (error) {
            console.error("Failed to refresh data:", error);
          }
        };
        fetchUpdatedData();
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to update phone number");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  const handleChangePassword = async () => {
    if (!loggedInEmail) {
      alert("No logged-in user found");
      return;
    }

    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      alert("Please fill all password fields correctly");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/patient/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          patient_email: loggedInEmail
        })
      });

      if (response.ok) {
        alert("Password changed successfully!");
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to change password");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!loggedInEmail) {
      alert("No logged-in user found");
      return;
    }

    if (!deletePassword) {
      alert("Please enter your password to delete account");
      return;
    }

    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/patient/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: "DELETE",
          patient_email: loggedInEmail
        })
      });

      if (response.ok) {
        alert("Account deleted successfully!");
        // Clear all localStorage data
        localStorage.clear();
        // Redirect to landing page
        navigate("/");
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4">
          <Link
            to="/patient"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <span className="font-semibold text-gray-900">Profile Settings</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile Info Card */}
        <div className="mb-8 rounded-2xl bg-white shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur border-4 border-white/30">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {dbProfile ? dbProfile.name : (loading ? 'Loading...' : profile.name)}
                </h1>
                <p className="text-blue-100">
                  {dbProfile ? dbProfile.email : (loading ? 'Loading...' : profile.email)}
                </p>
                {loading && <p className="text-xs text-blue-200 mt-1">Fetching from database...</p>}
              </div>
            </div>
          </div>
          
          {dbProfile && (
            <div className="p-6 bg-gray-50 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p className="font-medium text-gray-900">{dbProfile.phone}</p>
                </div>
                <div>
                  <span className="text-gray-500">Member Since:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(dbProfile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Change Phone Number */}
          <div className="rounded-2xl bg-white shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Change Phone Number</h2>
                <p className="text-sm text-gray-500">Update your contact number</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">New Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleChangePhone}
                disabled={!phone}
                className="w-full bg-[#00555A] hover:bg-[#004455] text-white"
              >
                Update Phone Number
              </Button>
            </div>
          </div>

          {/* Change Password */}
          <div className="rounded-2xl bg-white shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-pw" className="text-sm font-medium text-gray-700">Current Password</Label>
                <Input
                  id="current-pw"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="new-pw" className="text-sm font-medium text-gray-700">New Password</Label>
                <Input
                  id="new-pw"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirm-pw" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                <Input
                  id="confirm-pw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                className="w-full bg-[#00555A] hover:bg-[#004455] text-white"
              >
                Change Password
              </Button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="rounded-2xl bg-white shadow-lg p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="delete-pw" className="text-sm font-medium text-gray-700">Enter Password to Confirm</Label>
                <Input
                  id="delete-pw"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleDeleteAccount}
                  disabled={!deletePassword}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  className="border-[#00555A] text-[#00555A] hover:bg-[#00555A] hover:text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientProfile;
