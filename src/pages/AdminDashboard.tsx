import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Building2, 
  User,
  Search,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Users,
  MapPinned,
  LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ClinicData {
  id: number;
  clinic_id: string;
  clinic_name: string;
  email: string;
  phone: string;
  category: string | null;
  street_address: string | null;
  road: string | null;
  layout: string | null;
  section: string | null;
  city: string | null;
  pincode: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  doctor_name: string | null;
  specialization: string | null;
  experience: string | null;
  qualifications: string | null;
  image_urls: string[];
  status?: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at?: string;
  rejection_reason?: string | null;
  rejected_at?: string | null;
  available?: boolean;
  is_active?: boolean;
}

interface DashboardStats {
  pending_registrations: number;
  approved_registrations: number;
  rejected_registrations: number;
  total_active_clinics: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Secure session validation
  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    const adminLoggedIn = localStorage.getItem("admin_logged_in");
    const adminId = localStorage.getItem("admin_id");
    const sessionTime = localStorage.getItem("admin_session_time");
    
    // Check if session exists and is valid (24 hour expiry)
    const isValidSession = adminToken && adminLoggedIn && adminId && sessionTime;
    const sessionAge = isValidSession ? Date.now() - parseInt(sessionTime) : 0;
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (!isValidSession || sessionAge > maxSessionAge) {
      // Clear invalid/expired session
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_logged_in");
      localStorage.removeItem("admin_username");
      localStorage.removeItem("admin_id");
      localStorage.removeItem("admin_session_time");
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_session_time");
    navigate("/admin/login", { replace: true });
  };

  const [registrations, setRegistrations] = useState<ClinicData[]>([]);
  const [approvedClinics, setApprovedClinics] = useState<ClinicData[]>([]);
  const [rejectedClinics, setRejectedClinics] = useState<ClinicData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<ClinicData | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = "http://localhost:8000/admin";

  // Fetch registrations based on tab
  const fetchRegistrations = async (tab: string) => {
    try {
      if (tab === "pending") {
        const response = await fetch(`${API_BASE}/pending-registrations?status=pending`);
        if (!response.ok) throw new Error("Failed to fetch registrations");
        const data = await response.json();
        setRegistrations(data.registrations || []);
      } else if (tab === "approved") {
        const response = await fetch(`${API_BASE}/approved-clinics`);
        if (!response.ok) throw new Error("Failed to fetch approved clinics");
        const data = await response.json();
        setApprovedClinics(data.clinics || []);
      } else if (tab === "rejected") {
        const response = await fetch(`${API_BASE}/rejected-clinics`);
        if (!response.ok) throw new Error("Failed to fetch rejected clinics");
        const data = await response.json();
        setRejectedClinics(data.clinics || []);
      } else {
        const response = await fetch(`${API_BASE}/pending-registrations`);
        if (!response.ok) throw new Error("Failed to fetch registrations");
        const data = await response.json();
        setRegistrations(data.registrations || []);
      }
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/statistics`);
      if (!response.ok) throw new Error("Failed to fetch statistics");
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchRegistrations(activeTab),
        fetchStats()
      ]);
      setLoading(false);
    };

    loadData();
  }, [activeTab]);

  // Handle approve
  const handleApprove = async (reg: ClinicData) => {
    setActionLoading(true);
    try {
      // For production, get admin_id from auth context
      const adminId = "admin-001";
      
      const response = await fetch(
        `${API_BASE}/pending-registrations/${reg.id}/approve?admin_id=${adminId}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to approve registration");
      }

      const data = await response.json();
      toast.success(`Approved ${reg.clinic_name}. Email sent: ${data.email_sent ? "Yes" : "No"}`);
      
      // Refresh data
      await Promise.all([
        fetchRegistrations(activeTab === "all" ? undefined : activeTab),
        fetchStats()
      ]);
      setSelectedReg(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject
  const handleReject = async (reg: PendingRegistration) => {
    setActionLoading(true);
    try {
      // For production, get admin_id from auth context
      const adminId = "admin-001";
      
      const response = await fetch(
        `${API_BASE}/pending-registrations/${reg.id}/reject?admin_id=${adminId}&reason=${encodeURIComponent(rejectionReason)}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to reject registration");
      }

      const data = await response.json();
      toast.success(`Rejected ${reg.clinic_name}. Email sent: ${data.email_sent ? "Yes" : "No"}`);
      
      // Refresh data
      await Promise.all([
        fetchRegistrations(activeTab === "all" ? undefined : activeTab),
        fetchStats()
      ]);
      setSelectedReg(null);
      setRejectionReason("");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  // Get data based on active tab
  const getCurrentData = () => {
    if (activeTab === "approved") return approvedClinics;
    if (activeTab === "rejected") return rejectedClinics;
    return registrations;
  };

  // Filter registrations by search term
  const filteredRegistrations = getCurrentData().filter(reg =>
    reg.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage clinic registrations and approvals</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending_registrations}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-full">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved_registrations}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected_registrations}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-full">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Clinics</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total_active_clinics}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs and Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Clinic Registrations</CardTitle>
                <CardDescription>Review and manage clinic registration requests</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search clinics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredRegistrations.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No registrations found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRegistrations.map((reg) => (
                      <Card key={reg.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{reg.clinic_name}</h3>
                                {getStatusBadge(reg.status)}
                                {reg.category && (
                                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">
                                    {reg.category.replace(/_/g, " ")}
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  {reg.email}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  {reg.phone}
                                </div>
                                <div className="flex items-center gap-2 md:col-span-2">
                                  <MapPin className="w-4 h-4" />
                                  {reg.address}
                                </div>
                                {reg.latitude && reg.longitude && (
                                  <div className="flex items-center gap-2 md:col-span-2">
                                    <MapPinned className="w-4 h-4" />
                                    Lat: {reg.latitude}, Long: {reg.longitude}
                                  </div>
                                )}
                                {(reg.doctor_name || reg.specialization) && (
                                  <div className="flex items-center gap-2 md:col-span-2">
                                    <User className="w-4 h-4" />
                                    {reg.doctor_name ? `Dr. ${reg.doctor_name}` : "Doctor"}
                                    {reg.specialization && ` - ${reg.specialization}`}
                                  </div>
                                )}
                              </div>

                              <p className="text-xs text-muted-foreground">
                                Submitted: {new Date(reg.created_at).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setSelectedReg(reg)}
                              >
                                View Details
                              </Button>
                              {reg.status === "pending" && (
                                <>
                                  <Button
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(reg)}
                                    disabled={actionLoading}
                                  >
                                    {actionLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => setSelectedReg(reg)}
                                    disabled={actionLoading}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Detail/Action Dialog */}
      <Dialog open={!!selectedReg} onOpenChange={() => setSelectedReg(null)}>
        <DialogContent className="max-w-2xl">
          {selectedReg && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {selectedReg.clinic_name}
                </DialogTitle>
                <DialogDescription>
                  Registration ID: {selectedReg.clinic_id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Clinic Info */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Clinic Name</label>
                    <p className="text-sm font-medium">{selectedReg.clinic_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-sm capitalize">{selectedReg.category?.replace(/_/g, " ") || "Not specified"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{selectedReg.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm">{selectedReg.phone}</p>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Full Address</label>
                    <p className="text-sm">{selectedReg.address}</p>
                  </div>

                  {/* Individual Address Components */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Street / Building</label>
                    <p className="text-sm">{selectedReg.street_address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Road</label>
                    <p className="text-sm">{selectedReg.road}</p>
                  </div>
                  {selectedReg.layout && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Layout / Area</label>
                      <p className="text-sm">{selectedReg.layout}</p>
                    </div>
                  )}
                  {selectedReg.section && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Section / Block</label>
                      <p className="text-sm">{selectedReg.section}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">City</label>
                    <p className="text-sm">{selectedReg.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pincode</label>
                    <p className="text-sm">{selectedReg.pincode}</p>
                  </div>

                  {/* Coordinates */}
                  {selectedReg.latitude && selectedReg.longitude && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Coordinates</label>
                      <p className="text-sm">Lat: {selectedReg.latitude}, Long: {selectedReg.longitude}</p>
                    </div>
                  )}

                  {/* Doctor Details Section */}
                  {(selectedReg.doctor_name || selectedReg.specialization || selectedReg.experience || selectedReg.qualifications) && (
                    <div className="md:col-span-2 mt-2 pt-2 border-t">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Doctor Details</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-3 rounded-lg">
                        {selectedReg.doctor_name && (
                          <div>
                            <label className="text-xs text-muted-foreground">Doctor Name</label>
                            <p className="text-sm font-medium">Dr. {selectedReg.doctor_name}</p>
                          </div>
                        )}
                        {selectedReg.specialization && (
                          <div>
                            <label className="text-xs text-muted-foreground">Specialization</label>
                            <p className="text-sm">{selectedReg.specialization}</p>
                          </div>
                        )}
                        {selectedReg.experience && (
                          <div>
                            <label className="text-xs text-muted-foreground">Experience</label>
                            <p className="text-sm">{selectedReg.experience} years</p>
                          </div>
                        )}
                        {selectedReg.qualifications && (
                          <div>
                            <label className="text-xs text-muted-foreground">Qualifications</label>
                            <p className="text-sm">{selectedReg.qualifications}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedReg.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                    <p className="text-sm">{new Date(selectedReg.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {selectedReg.status === "pending" && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Rejection Reason (optional)
                    </label>
                    <Textarea
                      placeholder="Enter reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                )}

              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedReg(null)}>
                  Close
                </Button>
                {selectedReg.status === "pending" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedReg)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-1" />
                      )}
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedReg)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      Approve
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
