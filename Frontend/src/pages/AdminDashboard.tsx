import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  FileText,
  Building2,
  AlertCircle,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Lock,
  BarChart3,
  Plus,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const chartData = [
  { month: "Jan", users: 450, donations: 120, organizations: 35 },
  { month: "Feb", users: 580, donations: 145, organizations: 42 },
  { month: "Mar", users: 720, donations: 210, organizations: 48 },
  { month: "Apr", users: 890, donations: 280, organizations: 58 },
];

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [userFilter, setUserFilter] = useState("all");
  const [donationFilter, setDonationFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  /* ── Real API queries ── */
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.listUsers(),
  });

  const { data: donations = [] } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: () => adminApi.listDonations(),
  });

  const { data: pendingKYC = [] } = useQuery({
    queryKey: ["admin-kyc-pending"],
    queryFn: adminApi.getPendingKYC,
  });

  /* ── Mutations ── */
  const verifyMutation = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      adminApi.verifyUser(id, verified),
    onSuccess: () => {
      toast.success("User updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update user"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete user"),
  });

  const kycMutation = useMutation({
    mutationFn: ({ userId, status, notes }: { userId: string; status: 'APPROVED' | 'REJECTED'; notes?: string }) =>
      adminApi.updateKYCStatus(userId, status, notes),
    onSuccess: () => {
      toast.success("KYC verification updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update KYC"),
  });

  /* ── Derived stat cards from real data ── */
  const adminStats = [
    { label: "Total Users", value: stats?.totalUsers?.toString() ?? "—", icon: Users, color: "bg-blue-500" },
    { label: "Total Donations", value: stats?.totalDonations?.toString() ?? "—", icon: FileText, color: "bg-green-500" },
    { label: "Organizations", value: stats?.totalOrganizations?.toString() ?? "—", icon: Building2, color: "bg-purple-500" },
    { label: "Pending Verification", value: stats?.pendingVerification?.toString() ?? "—", icon: AlertCircle, color: "bg-orange-500" },
  ];

  /* ── Pie chart data from real donations ── */
  const statusCounts: Record<string, number> = {};
  donations.forEach((d: any) => {
    statusCounts[d.status] = (statusCounts[d.status] ?? 0) + 1;
  });
  const statusColors: Record<string, string> = {
    DELIVERED: "#10b981", PICKED_UP: "#f59e0b", REPORTED: "#3b82f6",
    MATCHED: "#8b5cf6", ACCEPTED: "#06b6d4", CANCELLED: "#ef4444", EXPIRED: "#6b7280",
  };
  const donationStatusData = Object.entries(statusCounts).map(([name, value]) => ({
    name, value, color: statusColors[name] ?? "#6b7280",
  }));

  /* ── Filters ── */
  const filteredUsers = users.filter((u: any) => {
    const matchesFilter = userFilter === "all"
      || (userFilter === "verified" && u.isVerified)
      || (userFilter === "pending" && !u.isVerified);
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredDonations = (donations as any[]).filter((d: any) =>
    donationFilter === "all" || d.status === donationFilter
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage platform operations, verify organizations, and monitor activity.
            </p>
          </div>
          <Button><BarChart3 className="w-4 h-4 mr-2" />Generate Report</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {adminStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card-elevated p-5 animate-fade-in">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart */}
          <div className="lg:col-span-2 card-elevated p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-1">Platform Growth</h3>
              <p className="text-sm text-muted-foreground">Users and activity trends</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: "0.5rem", backgroundColor: "#fff" }} />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="donations" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="organizations" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="card-elevated p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-1">Donation Status</h3>
              <p className="text-sm text-muted-foreground">Distribution by status</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {donationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* KYC Verification Pending */}
        {pendingKYC.length > 0 && (
          <div className="card-elevated p-6 mb-8 border-2 border-warning/30 bg-warning/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-warning" />
                  KYC Verification Pending
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review and approve organization documents
                </p>
              </div>
              <Badge variant="destructive">{pendingKYC.length} Pending</Badge>
            </div>

            <div className="space-y-3">
              {pendingKYC.map((user: any) => (
                <div key={user.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{user.name}</h4>
                        <Badge variant={user.role === 'DONOR' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                      
                      {user.role === 'RECIPIENT' && user.panNumber && (
                        <div className="space-y-1 mb-2">
                          <p className="text-xs font-medium text-foreground">PAN Number:</p>
                          <p className="text-sm font-mono text-muted-foreground">{user.panNumber}</p>
                          {user.panDocumentUrl && (
                            <a 
                              href={user.panDocumentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View Document
                            </a>
                          )}
                        </div>
                      )}
                      
                      {user.role === 'DONOR' && user.fssaiLicense && (
                        <div className="space-y-1 mb-2">
                          <p className="text-xs font-medium text-foreground">FSSAI License:</p>
                          <p className="text-sm font-mono text-muted-foreground">{user.fssaiLicense}</p>
                          {user.fssaiDocumentUrl && (
                            <a 
                              href={user.fssaiDocumentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View Document
                            </a>
                          )}
                        </div>
                      )}
                      
                      {user.organization && (
                        <p className="text-xs text-muted-foreground">
                          Org: {user.organization.name} ({user.organization.type})
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => kycMutation.mutate({ userId: user.id, status: 'APPROVED' })}
                        disabled={kycMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const notes = prompt("Reason for rejection (optional):");
                          kycMutation.mutate({ userId: user.id, status: 'REJECTED', notes: notes || undefined });
                        }}
                        disabled={kycMutation.isPending}
                      >
                        <ShieldX className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Management */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">User Management</h3>
              <p className="text-sm text-muted-foreground">Manage and verify platform users</p>
            </div>
            <Button variant="outline"><Plus className="w-4 h-4 mr-2" />Add User</Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold">Donations</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{user.role}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={user.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {user.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4 font-medium">{user._count?.donations ?? 0}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                        {!user.isVerified && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost"><CheckCircle className="w-4 h-4 text-green-600" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Verify User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to verify {user.name}? They will gain full platform access.
                              </AlertDialogDescription>
                              <div className="flex justify-end gap-3">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => verifyMutation.mutate({ id: user.id, verified: true })}
                                >
                                  Verify
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {user.isVerified && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost"><Lock className="w-4 h-4 text-blue-600" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Unverify User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to unverify {user.name}? They will lose verified status.
                              </AlertDialogDescription>
                              <div className="flex justify-end gap-3">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => verifyMutation.mutate({ id: user.id, verified: false })}
                                >
                                  Unverify
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure? This action cannot be undone. All associated data will be archived.
                            </AlertDialogDescription>
                            <div className="flex justify-end gap-3">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => deleteMutation.mutate(user.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Donations Management */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Donation Management</h3>
              <p className="text-sm text-muted-foreground">Monitor and oversee all donations</p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-4">
            <Select value={donationFilter} onValueChange={setDonationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Donations</SelectItem>
                <SelectItem value="REPORTED">Reported</SelectItem>
                <SelectItem value="MATCHED">Matched</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Donations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Food</th>
                  <th className="text-left py-3 px-4 font-semibold">Donor</th>
                  <th className="text-left py-3 px-4 font-semibold">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation: any) => (
                  <tr key={donation.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium text-primary">#{donation.id?.slice(0, 8)}</td>
                    <td className="py-3 px-4 capitalize">{donation.foodCategory ?? "—"}</td>
                    <td className="py-3 px-4">{donation.donor?.name ?? donation.organization?.name ?? "—"}</td>
                    <td className="py-3 px-4 font-medium">
                      {donation.quantityKg != null ? `${donation.quantityKg} kg` : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={
                        donation.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                        donation.status === "CANCELLED" || donation.status === "EXPIRED" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }>{donation.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Organization Verification */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Organization Verification</h3>
              <p className="text-sm text-muted-foreground">Users with registered organizations</p>
            </div>
          </div>

          {/* Organizations Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {users.filter((u: any) => u.organization).map((u: any) => (
              <div key={u.id} className="border border-border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{u.organization.name}</h4>
                    <p className="text-xs text-muted-foreground">{u.role} · {u.name}</p>
                  </div>
                  <Badge className={u.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {u.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  <p>Email: {u.email}</p>
                  <p>Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</p>
                </div>
                <div className="flex gap-2">
                  {!u.isVerified ? (
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => verifyMutation.mutate({ id: u.id, verified: true })}
                      disabled={verifyMutation.isPending}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />Verify
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => verifyMutation.mutate({ id: u.id, verified: false })}
                      disabled={verifyMutation.isPending}
                    >
                      <XCircle className="w-3 h-3 mr-1" />Unverify
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {users.filter((u: any) => u.organization).length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">No organizations registered yet.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
