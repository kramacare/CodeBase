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
import { ArrowLeft, Phone, Lock, Trash2, User, LogOut, Building2, Mail, MapPin, ImagePlus, X } from "lucide-react";

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
  const [address, setAddress] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
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
          setAddress(data.address || "");
          setImageUrls(data.image_urls || []);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const availableSlots = 5 - imageUrls.length;
      const filesToUpload = files.slice(0, availableSlots);
      
      // Check file sizes (max 5MB each)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const oversized = filesToUpload.filter(f => f.size > MAX_SIZE);
      if (oversized.length > 0) {
        setMessage({text: `${oversized[0].name} is above 5MB`, type: "error"});
        return;
      }
      
      setSelectedFiles(filesToUpload);
    }
  };

  const handleUploadImage = async () => {
    console.log("=== UPLOAD START ===");
    console.log("selectedFiles:", selectedFiles.length);
    console.log("loggedInClinicId:", loggedInClinicId);
    console.log("current imageUrls:", imageUrls.length);
    
    if (selectedFiles.length === 0 || !loggedInClinicId) {
      setMessage({text: "Please select files first", type: "error"});
      return;
    }

    if (imageUrls.length >= 5) {
      setMessage({text: "Maximum 5 images allowed", type: "error"});
      return;
    }

    setUploading(true);
    let uploadedCount = 0;
    let failedCount = 0;

    for (const file of selectedFiles) {
      console.log("Uploading file:", file.name, file.size, "bytes");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clinic_id", loggedInClinicId);

      try {
        const response = await fetch("http://localhost:8000/auth/clinic/upload-image", {
          method: "POST",
          body: formData
        });

        console.log("Response status:", response.status);

        if (response.ok) {
          uploadedCount++;
        } else {
          const error = await response.json();
          console.error("Upload failed:", error.detail);
          failedCount++;
        }
      } catch (error) {
        console.error("Upload error:", error);
        failedCount++;
      }
    }

    console.log("=== UPLOAD COMPLETE ===");
    console.log("uploadedCount:", uploadedCount);
    console.log("failedCount:", failedCount);

    setUploading(false);
    setSelectedFiles([]);

    if (uploadedCount > 0) {
      // ALWAYS fetch fresh data from API - this ensures correct unique URLs
      const dataResponse = await fetch(`http://localhost:8000/auth/clinic/data?clinic_id=${loggedInClinicId}`);
      if (dataResponse.ok) {
        const profileData = await dataResponse.json();
        setImageUrls(profileData.image_urls || []);
        setDbProfile(profileData);
        console.log("Updated imageUrls from API:", profileData.image_urls);
        setMessage({text: `${uploadedCount} image(s) uploaded successfully!`, type: "success"});
      } else {
        setMessage({text: `${uploadedCount} image(s) uploaded but refresh failed`, type: "error"});
      }
    }
    if (failedCount > 0) {
      setMessage({text: `${failedCount} image(s) failed to upload`, type: "error"});
    }
  };

  const handleRemoveImage = async (index: number) => {
    if (!loggedInClinicId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/auth/clinic/image/${loggedInClinicId}/${index}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        // Refresh the entire page to show correct images
        window.location.reload();
      } else {
        setMessage({text: "Failed to delete image", type: "error"});
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({text: "Error deleting image", type: "error"});
    }
  };

  const handleUpdateProfile = async () => {
    if (!loggedInClinicId) {
      setMessage({text: "No logged-in clinic found", type: "error"});
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/clinic/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: loggedInClinicId,
          address: address,
          image_urls: imageUrls
        })
      });

      if (response.ok) {
        setMessage({text: "Profile updated successfully!", type: "success"});
        const fetchUpdatedData = async () => {
          try {
            const dataResponse = await fetch(`http://localhost:8000/auth/clinic/data?clinic_id=${loggedInClinicId}`);
            if (dataResponse.ok) {
              const data = await dataResponse.json();
              setDbProfile(data);
              setAddress(data.address || "");
              setImageUrls(data.image_urls || []);
            }
          } catch (error) {
            console.error("Failed to refresh data:", error);
          }
        };
        fetchUpdatedData();
      } else {
        const error = await response.json();
        setMessage({text: error.detail || "Failed to update profile", type: "error"});
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
                  <span className="text-gray-500">Clinic ID:</span>
                  <p className="font-medium text-gray-900">{dbProfile.clinic_id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p className="font-medium text-gray-900">{dbProfile.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-500">Address:</span>
                  <p className="font-medium text-gray-900">{dbProfile.address || "Not set"}</p>
                </div>
                {dbProfile.image_urls && dbProfile.image_urls.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Images:</span>
                    <p className="font-medium text-gray-900">{dbProfile.image_urls.length} image(s) stored</p>
                  </div>
                )}
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

          {/* Change Address */}
          <div className="rounded-2xl bg-white shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <MapPin className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Change Address</h2>
                <p className="text-sm text-gray-500">Update clinic location</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Current Address:</p>
                <p className="font-medium text-gray-900">{dbProfile?.address || "Not set"}</p>
              </div>
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">New Address</Label>
                <Input
                  id="address"
                  placeholder="Enter full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleUpdateProfile}
                disabled={!address}
                className="w-full bg-[#00555A] hover:bg-[#004455] text-white"
              >
                Update Address
              </Button>
            </div>
          </div>

          {/* Upload Clinic Images */}
          <div className="rounded-2xl bg-white shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <ImagePlus className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Clinic Images</h2>
                <p className="text-sm text-gray-500">Add up to 5 image URLs</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Current Images - only show non-null URLs */}
              {imageUrls.filter(url => url !== null && url !== undefined).length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imageUrls.map((url, idx) => (
                    url ? (
                      <div key={idx} className="relative">
                        <img src={`http://localhost:8000${url}`} alt={`Clinic ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                        <button
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                          title="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null
                  ))}
                </div>
              )}
              
              {/* Add New Image */}
              {imageUrls.length < 5 && (
                <div className="space-y-3">
                  <div className="flex gap-2 items-center">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {/* Custom file upload button */}
                    <label
                      htmlFor="file-upload"
                      className="flex-1 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <ImagePlus className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600 truncate">
                        {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : "Choose files..."}
                      </span>
                    </label>
                    <Button 
                      onClick={handleUploadImage} 
                      variant="outline"
                      disabled={selectedFiles.length === 0 || uploading}
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">Max 5MB. Supported: JPG, PNG, GIF, WebP</p>
                </div>
              )}
              
              <p className="text-xs text-gray-500">{imageUrls.length}/5 images • Stored in database</p>
              
              <Button 
                onClick={handleUpdateProfile}
                className="w-full bg-[#00555A] hover:bg-[#004455] text-white"
              >
                Save Images
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
