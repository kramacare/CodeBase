import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, Lock, Trash2, User, LogOut, Building2, QrCode, MapPin, ImagePlus, X, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ClinicProfile = () => {
  const navigate = useNavigate();
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const getLoggedInClinicId = () => {
    try {
      return localStorage.getItem("clinic_id");
    } catch (error) {
      console.error("Error getting clinic ID from localStorage:", error);
    }
    return null;
  };

  const loggedInClinicId = getLoggedInClinicId();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showQrDialog, setShowQrDialog] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchClinicData = async () => {
      if (!loggedInClinicId) {
        setMessage({ text: "No logged-in clinic found", type: "error" });
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
          setMessage({ text: "Failed to fetch clinic data", type: "error" });
        }
      } catch (error) {
        setMessage({ text: "Network error. Please try again.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    void fetchClinicData();
  }, [loggedInClinicId]);

  const handleChangePhone = async () => {
    if (!loggedInClinicId) {
      setMessage({ text: "No logged-in clinic found", type: "error" });
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/clinic/change-phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: loggedInClinicId,
          new_phone: phone,
        }),
      });

      if (response.ok) {
        setMessage({ text: "Phone number updated successfully!", type: "success" });
      } else {
        const error = await response.json();
        setMessage({ text: error.detail || "Failed to update phone number", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const availableSlots = 5 - imageUrls.length;
      const filesToUpload = files.slice(0, availableSlots);
      const MAX_SIZE = 5 * 1024 * 1024;
      const oversized = filesToUpload.filter((f) => f.size > MAX_SIZE);
      if (oversized.length > 0) {
        setMessage({ text: `${oversized[0].name} is above 5MB`, type: "error" });
        return;
      }
      setSelectedFiles(filesToUpload);
    }
  };

  const handleUploadImage = async () => {
    if (selectedFiles.length === 0 || !loggedInClinicId) {
      setMessage({ text: "Please select files first", type: "error" });
      return;
    }

    if (imageUrls.length >= 5) {
      setMessage({ text: "Maximum 5 images allowed", type: "error" });
      return;
    }

    setUploading(true);
    let uploadedCount = 0;
    let failedCount = 0;

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clinic_id", loggedInClinicId);

      try {
        const response = await fetch("http://localhost:8000/auth/clinic/upload-image", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          uploadedCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
      }
    }

    setUploading(false);
    setSelectedFiles([]);

    if (uploadedCount > 0) {
      const dataResponse = await fetch(`http://localhost:8000/auth/clinic/data?clinic_id=${loggedInClinicId}`);
      if (dataResponse.ok) {
        const profileData = await dataResponse.json();
        setImageUrls(profileData.image_urls || []);
        setDbProfile(profileData);
        setMessage({ text: `${uploadedCount} image(s) uploaded successfully!`, type: "success" });
      }
    }
    if (failedCount > 0) {
      setMessage({ text: `${failedCount} image(s) failed to upload`, type: "error" });
    }
  };

  const handleRemoveImage = async (index: number) => {
    if (!loggedInClinicId) return;

    try {
      const response = await fetch(`http://localhost:8000/auth/clinic/image/${loggedInClinicId}/${index}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        setMessage({ text: "Failed to delete image", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error deleting image", type: "error" });
    }
  };

  const handleUpdateProfile = async () => {
    if (!loggedInClinicId) {
      setMessage({ text: "No logged-in clinic found", type: "error" });
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/clinic/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: loggedInClinicId,
          address,
          image_urls: imageUrls,
        }),
      });

      if (response.ok) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        const dataResponse = await fetch(`http://localhost:8000/auth/clinic/data?clinic_id=${loggedInClinicId}`);
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          setDbProfile(data);
          setAddress(data.address || "");
          setImageUrls(data.image_urls || []);
        }
      } else {
        const error = await response.json();
        setMessage({ text: error.detail || "Failed to update profile", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    }
  };

  const handleChangePassword = async () => {
    if (!loggedInClinicId) {
      setMessage({ text: "No logged-in clinic found", type: "error" });
      return;
    }

    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      setMessage({ text: "Please fill all password fields correctly", type: "error" });
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/clinic/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: loggedInClinicId,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        setMessage({ text: "Password changed successfully!", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const error = await response.json();
        setMessage({ text: error.detail || "Failed to change password", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!loggedInClinicId) {
      setMessage({ text: "No logged-in clinic found", type: "error" });
      return;
    }

    const password = prompt("Enter your password to delete account:");
    if (!password) {
      setMessage({ text: "Password required to delete account", type: "error" });
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
          clinic_id: loggedInClinicId,
        }),
      });

      if (response.ok) {
        setMessage({ text: "Account deleted successfully", type: "success" });
        localStorage.clear();
        navigate("/clinic/login");
      } else {
        setMessage({ text: "Failed to delete account", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error deleting account", type: "error" });
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

  const downloadClinicQr = async () => {
    const clinicQrUrl = getClinicQrUrl();
    if (!clinicQrUrl) return;

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(clinicQrUrl)}`;

    try {
      const response = await fetch(qrImageUrl);
      if (!response.ok) {
        setMessage({ text: "Failed to download QR code", type: "error" });
        return;
      }

      const qrBlob = await response.blob();
      const qrObjectUrl = URL.createObjectURL(qrBlob);

      const qrImg = new Image();
      qrImg.src = qrObjectUrl;

      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => reject(new Error("Failed to load QR image"));
      });

      // A4 portrait at ~150dpi: 1240x1754
      const width = 1240;
      const height = 1754;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(qrObjectUrl);
        setMessage({ text: "Failed to generate QR sheet", type: "error" });
        return;
      }

      // Background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Header: KRAMA
      ctx.fillStyle = "#00555A";
      ctx.font = "bold 64px Arial";
      ctx.textAlign = "center";
      ctx.fillText("KRAMA", width / 2, 140);

      // Clinic name
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 42px Arial";
      const clinicName = dbProfile?.clinic_name || "Clinic";
      ctx.fillText(clinicName, width / 2, 220);

      // Doctor name
      ctx.fillStyle = "#334155";
      ctx.font = "28px Arial";
      const doctorName = dbProfile?.doctor_name || "Doctor";
      ctx.fillText(doctorName, width / 2, 270);

      // QR placement
      const qrSize = 720;
      const qrX = (width - qrSize) / 2;
      const qrY = 420;

      // QR border card
      ctx.fillStyle = "#F8FAFC";
      const cardPad = 30;
      const cardX = qrX - cardPad;
      const cardY = qrY - cardPad;
      const cardW = qrSize + cardPad * 2;
      const cardH = qrSize + cardPad * 2;

      const r = 24;
      ctx.beginPath();
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardW - r, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
      ctx.lineTo(cardX + cardW, cardY + cardH - r);
      ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
      ctx.lineTo(cardX + r, cardY + cardH);
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
      ctx.lineTo(cardX, cardY + r);
      ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx.closePath();
      ctx.fill();

      // Draw QR
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Overlay KRAMA in center of QR
      const badgeW = 200;
      const badgeH = 56;
      const badgeX = width / 2 - badgeW / 2;
      const badgeY = qrY + qrSize / 2 - badgeH / 2;

      ctx.fillStyle = "rgba(255,255,255,0.95)";
      const br = 10;
      ctx.beginPath();
      ctx.moveTo(badgeX + br, badgeY);
      ctx.lineTo(badgeX + badgeW - br, badgeY);
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + br);
      ctx.lineTo(badgeX + badgeW, badgeY + badgeH - br);
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - br, badgeY + badgeH);
      ctx.lineTo(badgeX + br, badgeY + badgeH);
      ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - br);
      ctx.lineTo(badgeX, badgeY + br);
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + br, badgeY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#00555A";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText("KRAMA", width / 2, badgeY + 38);

      // Footer
      ctx.fillStyle = "#64748B";
      ctx.font = "22px Arial";
      ctx.fillText("Scan to join the queue", width / 2, 1240);
      ctx.font = "18px Arial";
      const clinicIdLine = `Clinic ID: ${dbProfile?.clinic_id || ""}`;
      ctx.fillText(clinicIdLine, width / 2, 1280);

      URL.revokeObjectURL(qrObjectUrl);

      canvas.toBlob((outBlob) => {
        if (!outBlob) {
          setMessage({ text: "Failed to generate QR sheet", type: "error" });
          return;
        }

        const outUrl = URL.createObjectURL(outBlob);
        const a = document.createElement("a");
        a.href = outUrl;
        a.download = `${dbProfile?.clinic_id || "clinic"}-qr-a4.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(outUrl);
      }, "image/png");
    } catch (error) {
      setMessage({ text: "Failed to download QR code", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="section-container flex h-16 items-center gap-3 px-4 md:px-8">
          <Link to="/clinic" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-sm font-semibold text-foreground">Clinic Profile</span>
        </div>
      </header>

      {message && (
        <div
          className={`fixed right-4 top-20 z-50 rounded-full px-4 py-2 text-sm shadow-lg ${
            message.type === "success" ? "bg-primary text-white" : "bg-red-600 text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      <main className="section-container px-4 py-8 md:px-8 md:py-10">
        <section className="rounded-[32px] bg-primary px-6 py-8 text-primary-foreground shadow-[0_24px_70px_-36px_rgba(31,92,84,0.9)] md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
              <Building2 className="h-10 w-10" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-primary-foreground/70">Clinic Account</p>
              <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
                {dbProfile?.clinic_name || "Clinic"}
              </h1>
              <p className="mt-2 text-primary-foreground/75">{dbProfile?.email || "clinic@example.com"}</p>
            </div>
          </div>

          {dbProfile && (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <ProfileStat label="Clinic ID" value={dbProfile.clinic_id} mono />
              <ProfileStat label="Phone" value={dbProfile.phone} />
              <ProfileStat label="Address" value={dbProfile.address || "Not set"} />
            </div>
          )}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProfileCard icon={Phone} title="Change Phone Number" description="Update your contact number">
            <div>
              <Label htmlFor="phone">New Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2" />
            </div>
            <Button onClick={handleChangePhone} disabled={!phone} className="w-full">
              Update Phone Number
            </Button>
          </ProfileCard>

          <ProfileCard icon={MapPin} title="Change Address" description="Update clinic location">
            <div className="rounded-2xl bg-secondary p-4 text-sm text-foreground">
              <p className="text-muted-foreground">Current Address</p>
              <p className="mt-1 font-medium">{dbProfile?.address || "Not set"}</p>
            </div>
            <div>
              <Label htmlFor="address">New Address</Label>
              <Input id="address" placeholder="Enter full address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2" />
            </div>
            <Button onClick={handleUpdateProfile} disabled={!address} className="w-full">
              Update Address
            </Button>
          </ProfileCard>

          <ProfileCard icon={ImagePlus} title="Clinic Images" description="Upload and manage up to 5 images">
            {imageUrls.filter(Boolean).length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imageUrls.map((url, idx) =>
                  url ? (
                    <div key={idx} className="relative">
                      <img src={`http://localhost:8000${url}`} alt={`Clinic ${idx + 1}`} className="h-20 w-full rounded-lg object-cover" />
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null
                )}
              </div>
            )}

            {imageUrls.length < 5 && (
              <div className="space-y-3">
                <input type="file" id="file-upload" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 transition hover:bg-secondary"
                >
                  <ImagePlus className="h-5 w-5 text-primary" />
                  <span className="truncate text-sm text-muted-foreground">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : "Choose files..."}
                  </span>
                </label>
                <Button onClick={handleUploadImage} variant="outline" disabled={selectedFiles.length === 0 || uploading} className="w-full">
                  {uploading ? "Uploading..." : "Upload Images"}
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">{imageUrls.length}/5 images stored</p>
            <Button onClick={handleUpdateProfile} className="w-full">
              Save Images
            </Button>
          </ProfileCard>

          <ProfileCard icon={Lock} title="Change Password" description="Update your account password">
            <div>
              <Label htmlFor="current-pw">Current Password</Label>
              <Input id="current-pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="new-pw">New Password</Label>
              <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <Input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2" />
            </div>
            <Button onClick={handleChangePassword} disabled={!currentPassword || !newPassword || newPassword !== confirmPassword} className="w-full">
              Change Password
            </Button>
          </ProfileCard>

          <div className="lg:col-span-2">
            <ProfileCard icon={QrCode} title="QR Code" description="Show QR code for patients to join queue">
              <Button onClick={() => setShowQrDialog(true)} className="w-fit bg-primary text-white hover:bg-primary/90">
                <QrCode className="mr-2 h-4 w-4" />
                Show QR Code
              </Button>
            </ProfileCard>
          </div>

          <div className="lg:col-span-2">
            <ProfileCard icon={Trash2} title="Delete Account" description="Permanently delete your clinic account and all data" danger>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDeleteAccount} className="bg-red-600 text-white hover:bg-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </ProfileCard>
          </div>
        </section>
      </main>

      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-4 text-center">
            <DialogTitle className="font-display text-2xl font-bold text-primary">KRAMA</DialogTitle>
            <DialogDescription className="text-sm">Scan to join the queue</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {getClinicQrUrl() && (
              <div className="relative">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getClinicQrUrl())}`}
                  alt="Clinic QR Code"
                  className="h-44 w-44 rounded-lg shadow-lg"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="rounded bg-white/95 px-2 py-0.5 text-xs font-bold tracking-widest text-primary shadow-sm">KRAMA</span>
                </div>
              </div>
            )}
            <p className="mt-4 text-sm text-muted-foreground">{dbProfile?.clinic_name}</p>

            <Button
              title="Download QR Code"
              variant="outline"
              onClick={downloadClinicQr}
              className="mt-4 w-full"
              disabled={!getClinicQrUrl()}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProfileStat = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div className="rounded-[22px] bg-white/10 px-4 py-4">
    <p className="text-sm text-primary-foreground/70">{label}</p>
    <p className={`mt-2 text-lg font-bold text-white ${mono ? "font-mono" : ""}`}>{value}</p>
  </div>
);

const ProfileCard = ({
  icon: Icon,
  title,
  description,
  children,
  danger = false,
}: {
  icon: any;
  title: string;
  description: string;
  children: React.ReactNode;
  danger?: boolean;
}) => (
  <div className={`rounded-[28px] border p-6 shadow-sm ${danger ? "border-red-200 bg-red-50/50" : "border-border/70 bg-white"}`}>
    <div className="mb-6 flex items-center gap-3">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${danger ? "bg-red-100 text-red-600" : "bg-secondary text-primary"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export default ClinicProfile;
