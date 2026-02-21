import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Lock, Phone, MapPin, Building2, Mail, Calendar, Clock, Edit, Save, Eye, EyeOff, Key, LogOut, Trash2 } from "lucide-react";

const ClinicProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showClinicInfo, setShowClinicInfo] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@clinic.com",
    phone: "+1 (555) 123-4567",
    specialization: "General Physician",
    license: "MD-123456",
    experience: "10 years",
    bio: "Experienced general physician with focus on preventive care and chronic disease management."
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Phone state
  const [phone, setPhone] = useState({
    current: "+1 (555) 123-4567",
    new: ""
  });

  // Address state
  const [address, setAddress] = useState({
    current: {
      street: "123 Medical Center Drive",
      city: "Boston",
      state: "MA",
      zip: "02115",
      country: "United States"
    },
    new: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: ""
    }
  });

  // Clinic info state
  const [clinicInfo, setClinicInfo] = useState({
    name: "CityCare Medical Center",
    email: "contact@citycare.com",
    phone: "+1 (555) 987-6543",
    address: "456 Health Avenue, Boston, MA 02115",
    website: "www.citycare.com",
    established: "2015",
    license: "CLINIC-001",
    taxId: "12-3456789",
    description: "Comprehensive healthcare facility providing primary care, pediatrics, and specialized medical services.",
    operatingHours: "Mon-Fri: 8AM-6PM, Sat: 9AM-1PM, Sun: Closed"
  });

  const [editingClinicInfo, setEditingClinicInfo] = useState(false);

  const handleSaveProfile = () => {
    // Save profile logic
    console.log("Saving profile...");
  };

  const handleChangePassword = () => {
    if (passwords.new && passwords.new === passwords.confirm) {
      // Change password logic
      console.log("Password changed successfully");
      setPasswords({ ...passwords, current: passwords.new, new: "", confirm: "" });
      setShowPassword(false);
    }
  };

  const handleChangePhone = () => {
    if (phone.new) {
      // Change phone logic
      console.log("Phone changed successfully");
      setPhone({ ...phone, current: phone.new, new: "" });
      setShowPhone(false);
    }
  };

  const handleChangeAddress = () => {
    if (address.current.street && address.current.city && address.current.state && address.current.zip) {
      // Change address logic
      console.log("Address changed successfully");
      setAddress({ ...address, current: { ...address.current, street: "", city: "", state: "", zip: "", country: "" } });
      setShowAddress(false);
    }
  };

  const handleChangeClinicInfo = () => {
    if (clinicInfo.name && clinicInfo.email && clinicInfo.phone) {
      // Change clinic info logic
      console.log("Clinic info changed successfully");
      // Update logic here
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("queuesmart_clinic_profile");
      window.location.href = "/clinic/login";
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Account deleted");
      // Delete account logic
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link
            to="/clinic"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-semibold text-foreground">Profile Settings</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-[#00555A] text-[#00555A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'security'
                  ? 'border-[#00555A] text-[#00555A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Lock className="h-4 w-4 mr-2" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('clinic')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'clinic'
                  ? 'border-[#00555A] text-[#00555A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Clinic Info
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Doctor Details */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                  <User className="h-6 w-6 text-[#00555A]" />
                  Doctor Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <Input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <Input
                      value={profile.specialization}
                      onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <Input
                      value={profile.license}
                      onChange={(e) => setProfile({ ...profile, license: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <Input
                      type="number"
                      value={profile.experience}
                      onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-[#00555A] text-white hover:opacity-90 rounded-xl px-6 py-3 transition-all duration-200"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-[#00555A]" />
                  Security Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <Input
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={handleChangePassword}
                      disabled={!passwords.new || !passwords.confirm || passwords.new !== passwords.confirm}
                      className="flex-1 bg-[#00555A] text-white hover:opacity-90 rounded-xl px-6 py-3 transition-all duration-200 disabled:opacity-50"
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPasswords({ current: "", new: "", confirm: "" });
                        setShowPassword(false);
                      }}
                      className="flex-1 border-gray-300 text-[#0F172A] hover:bg-gray-50 rounded-xl px-6 py-3 transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>

              {/* Change Phone */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                  <Phone className="h-6 w-6 text-[#00555A]" />
                  Change Phone Number
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Phone</label>
                    <Input
                      type="tel"
                      value={phone.current}
                      onChange={(e) => setPhone({ ...phone, current: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Phone Number</label>
                    <Input
                      type="tel"
                      value={phone.new}
                      onChange={(e) => setPhone({ ...phone, new: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={handleChangePhone}
                      disabled={!phone.new}
                      className="flex-1 bg-[#00555A] text-white hover:opacity-90 rounded-xl px-6 py-3 transition-all duration-200 disabled:opacity-50"
                    >
                      Update Phone
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPhone({ ...phone, new: "" });
                        setShowPhone(false);
                      }}
                      className="flex-1 border-gray-300 text-[#0F172A] hover:bg-gray-50 rounded-xl px-6 py-3 transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>

              {/* Change Address */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-[#00555A]" />
                  Change Address
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <Input
                        value={address.current.street}
                        onChange={(e) => setAddress({ ...address, current: { ...address.current, street: e.target.value } })}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <Input
                        value={address.current.city}
                        onChange={(e) => setAddress({ ...address, current: { ...address.current, city: e.target.value } })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <Input
                        value={address.current.state}
                        onChange={(e) => setAddress({ ...address, current: { ...address.current, state: e.target.value } })}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                      <Input
                        value={address.current.zip}
                        onChange={(e) => setAddress({ ...address, current: { ...address.current, zip: e.target.value } })}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <Input
                        value={address.current.country}
                        onChange={(e) => setAddress({ ...address, current: { ...address.current, country: e.target.value } })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={handleChangeAddress}
                      disabled={!address.current.street || !address.current.city || !address.current.state || !address.current.zip}
                      className="flex-1 bg-[#00555A] text-white hover:opacity-90 rounded-xl px-6 py-3 transition-all duration-200 disabled:opacity-50"
                    >
                      Update Address
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddress({ ...address, current: { ...address.current, street: "", city: "", state: "", zip: "", country: "" } });
                        setShowAddress(false);
                      }}
                      className="flex-1 border-gray-300 text-[#0F172A] hover:bg-gray-50 rounded-xl px-6 py-3 transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clinic Info Tab */}
          {activeTab === 'clinic' && (
            <div className="space-y-6">
              {/* Clinic Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-[#00555A]" />
                  Clinic Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
                    <Input
                      value={clinicInfo.name}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={clinicInfo.email}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <Input
                      type="tel"
                      value={clinicInfo.phone}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <Input
                      value={clinicInfo.website}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, website: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Established Year</label>
                    <Input
                      type="number"
                      value={clinicInfo.established}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, established: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <Input
                      value={clinicInfo.license}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, license: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                    <Input
                      value={clinicInfo.taxId}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, taxId: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <Input
                        value={clinicInfo.address}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours</label>
                      <Input
                        value={clinicInfo.operatingHours}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, operatingHours: e.target.value })}
                        className="w-full"
                        placeholder="Mon-Fri: 8AM-6PM, Sat: 9AM-1PM, Sun: Closed"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={clinicInfo.description}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, description: e.target.value })}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Describe your clinic..."
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <Trash2 className="h-6 w-6 text-red-600" />
                  Danger Zone
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Delete Account</p>
                      <p className="text-sm text-gray-600">Permanently delete your clinic account and all data</p>
                    </div>
                    <Button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 text-white hover:bg-red-700 rounded-xl px-6 py-3 transition-all duration-200"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Logout</p>
                      <p className="text-sm text-gray-600">Sign out of your current session</p>
                    </div>
                    <Button
                      onClick={handleLogout}
                      className="bg-orange-500 text-white hover:bg-orange-600 rounded-xl px-6 py-3 transition-all duration-200"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClinicProfile;
