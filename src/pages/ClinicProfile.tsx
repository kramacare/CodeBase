import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, Lock, Trash2, User, LogOut, Building2, Mail, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ClinicProfile = () => {
  const navigate = useNavigate();
  const [dbProfile, setDbProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Message state
  const [message, setMessage] = useState<{text: string; type: "success" | "error"} | null>(null);

  // Get the actual logged-in clinic ID from localStorage
  const getLoggedInClinicId = () => {
    try {
      const clinicId = localStorage.getItem("clinic_id");
      return clinicId;
    } catch (error) {
      console.error("Error getting clinic ID from localStorage:", error);
    }
    return null;
  };
  
  const loggedInClinicId = getLoggedInClinicId();
  
  // Form states
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch clinic data from database
  useEffect(() => {
    const fetchClinicData = async () => {
      if (!loggedInClinicId) {
        setMessage({text: "No logged-in clinic found", type: "error"});
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/auth/clinic/data?clinic_id=${loggedInClinicId}`);
        
        if (response.ok) {
          const data = await response.json();
          setDbProfile(data);
          setPhone(data.phone || "");
        } else {
          setMessage({text: "Failed to fetch clinic data", type: "error"});
        }
      } catch (error) {
        setMessage({text: "Network error. Please try again.", type: "error"});
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, [loggedInClinicId]);

  const handleSave = async () => {
    // This function is not needed - we'll remove editing functionality
  };

  const handleChangePhone = async () => {
    if (!loggedInClinicId) {
      setMessage({text: "No logged-in clinic found", type: "error"});
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/clinic/change-phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: loggedInClinicId,
          new_phone: phone
        })
      });

      if (response.ok) {
        setMessage({text: "Phone number updated successfully!", type: "success"});
        const fetchUpdatedData = async () => {
          try {
            const dataResponse = await fetch(`http://localhost:8000/auth/clinic/data?clinic_id=${loggedInClinicId}`);
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
        setMessage({text: error.detail || "Failed to update phone number", type: "error"});
      }
    } catch (error) {
      setMessage({text: "Network error. Please try again.", type: "error"});
    }
  };

  const handleChangePassword = async () => {
    if (!loggedInClinicId) {
      setMessage({text: "No logged-in clinic found", type: "error"});
      return;
    }

    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      setMessage({text: "Please fill all password fields correctly", type: "error"});
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/clinic/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: loggedInClinicId,
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (response.ok) {
        setMessage({text: "Password changed successfully!", type: "success"});
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const error = await response.json();
        setMessage({text: error.detail || "Failed to change password", type: "error"});
      }
    } catch (error) {
      setMessage({text: "Network error. Please try again.", type: "error"});
    }
  };

  const handleDeleteAccount = async () => {
    if (!loggedInClinicId) {
      setMessage({text: "No logged-in clinic found", type: "error"});
      return;
    }

    const password = prompt("Enter your password to delete account:");
    if (!password) {
      setMessage({text: "Password required to delete account", type: "error"});
      return;
    }

    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/auth/clinic/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: loggedInClinicId
        })
      });

      if (response.ok) {
        setMessage({text: "Account deleted successfully", type: "success"});
        localStorage.clear();
        navigate("/clinic/login");
      } else {
        setMessage({text: "Failed to delete account", type: "error"});
      }
    } catch (error) {
      setMessage({text: "Error deleting account", type: "error"});
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("krama_patient_profile");
    localStorage.removeItem("krama_active_appointment");
    localStorage.removeItem("krama_visit_history");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getClinicQrUrl = () => {
    if (!dbProfile?.clinic_id) return "";
    return `${window.location.origin}/walkin?clinic_id=${dbProfile.clinic_id}`;
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
            to="/clinic"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <span className="font-semibold text-gray-900">Clinic Profile Settings</span>
        </div>
      </header>

      {/* Message Toast */}
      {message && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-fade-in ${
          message.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {message.text}
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile Info Card */}
        <div className="mb-8 rounded-2xl bg-white shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur border-4 border-white/30">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {dbProfile ? dbProfile.clinic_name : (loading ? 'Loading...' : 'Clinic')}
                </h1>
                <p className="text-blue-100">
                  {dbProfile ? dbProfile.email : (loading ? 'Loading...' : 'clinic@example.com')}
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
                  <span className="text-gray-500">Address:</span>
                  <p className="font-medium text-gray-900">{dbProfile.address}</p>
                </div>
                <div>
                  <span className="text-gray-500">Doctor Name:</span>
                  <p className="font-medium text-gray-900">{dbProfile.doctor_name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Clinic ID:</span>
                  <p className="font-medium text-gray-900 font-mono">{dbProfile.clinic_id}</p>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <QrCode className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">QR Code</h2>
                <p className="text-sm text-gray-500">Show QR code for patients to join queue</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowQrDialog(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Show QR Code
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
                <p className="text-sm text-gray-500">Permanently delete your clinic account and all data</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleDeleteAccount}
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
      </main>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-4">
            <DialogTitle className="text-xl font-extrabold tracking-tight text-[#00555A]">KRAMA</DialogTitle>
            <DialogDescription className="text-sm">
              Scan to join the queue
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {getClinicQrUrl() && (
              <div className="relative group">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getClinicQrUrl())}`}
                  alt="Clinic QR Code"
                  className="w-44 h-44 rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-[#00555A] tracking-widest bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm border border-[#00555A]/10">
                    KRAMA
                  </span>
                </div>
              </div>
            )}
            <p className="mt-4 text-sm text-gray-500 text-center">
              {dbProfile?.clinic_name}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicProfile;
