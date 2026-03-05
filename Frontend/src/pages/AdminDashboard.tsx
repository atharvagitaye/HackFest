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
  TrendingUp,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Calendar,
  BarChart3,
  Plus,
} from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock Data
const adminStats = [
  { label: "Total Users", value: "2,847", change: "+12%", icon: Users, color: "bg-blue-500" },
  { label: "Active Donations", value: "342", change: "+23%", icon: FileText, color: "bg-green-500" },
  { label: "Organizations", value: "156", change: "+8%", icon: Building2, color: "bg-purple-500" },
  { label: "Pending Verification", value: "23", change: "-5%", icon: AlertCircle, color: "bg-orange-500" },
];

const userData = [
  { id: 1, name: "John Restaurant", email: "john@restaurant.com", role: "DONOR", status: "verified", joinedDate: "2025-12-15", donations: 45 },
  { id: 2, name: "Mission Shelter", email: "info@mission.gov", role: "RECIPIENT", status: "verified", joinedDate: "2025-11-20", donations: 0 },
  { id: 3, name: "Green NGO", email: "contact@greenngoa.org", role: "RECIPIENT", status: "pending", joinedDate: "2026-02-10", donations: 0 },
  { id: 4, name: "City Catering", email: "admin@citycatering.com", role: "DONOR", status: "verified", joinedDate: "2025-10-05", donations: 78 },
  { id: 5, name: "Riverside Community Center", email: "riverside@cc.org", role: "RECIPIENT", status: "flagged", joinedDate: "2026-01-15", donations: 0 },
  { id: 6, name: "Fresh Bakery", email: "hello@freshbakery.com", role: "DONOR", status: "active", joinedDate: "2026-02-01", donations: 12 },
];

const donationData = [
  { id: "D001", donor: "John Restaurant", quantity: "45kg", status: "delivered", recipient: "Mission Shelter", dateCreated: "2026-03-01" },
  { id: "D002", donor: "City Catering", quantity: "120kg", status: "in-transit", recipient: "Green NGO", dateCreated: "2026-03-03" },
  { id: "D003", donor: "Fresh Bakery", quantity: "12kg", status: "pending", recipient: "Riverside CC", dateCreated: "2026-03-04" },
  { id: "D004", donor: "John Restaurant", quantity: "38kg", status: "matched", recipient: "Mission Shelter", dateCreated: "2026-03-04" },
  { id: "D005", donor: "City Catering", quantity: "95kg", status: "cancelled", recipient: "-", dateCreated: "2026-02-28" },
];

const organizationVerification = [
  { id: "ORG001", name: "Green Future NGO", type: "NGO", status: "pending", submittedDate: "2026-02-28", documents: 5 },
  { id: "ORG002", name: "Elite Bistro", type: "RESTAURANT", status: "approved", submittedDate: "2026-02-15", documents: 3 },
  { id: "ORG003", name: "Health Institute", type: "INSTITUTION", status: "rejected", submittedDate: "2026-02-10", documents: 4, reason: "Invalid address" },
  { id: "ORG004", name: "Urban Harvest", type: "NGO", status: "under-review", submittedDate: "2026-03-01", documents: 6 },
];

const chartData = [
  { month: "Jan", users: 450, donations: 120, organizations: 35 },
  { month: "Feb", users: 580, donations: 145, organizations: 42 },
  { month: "Mar", users: 720, donations: 210, organizations: 48 },
  { month: "Apr", users: 890, donations: 280, organizations: 58 },
];

const donationStatusData = [
  { name: "Delivered", value: 234, color: "#10b981" },
  { name: "In Transit", value: 89, color: "#f59e0b" },
  { name: "Pending", value: 45, color: "#3b82f6" },
  { name: "Cancelled", value: 12, color: "#ef4444" },
];

const AdminDashboard = () => {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [userFilter, setUserFilter] = useState("all");
  const [donationFilter, setDonationFilter] = useState("all");
  const [orgFilter, setOrgFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = userData.filter((user) => {
    const matchesFilter = userFilter === "all" || user.status === userFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredDonations = donationData.filter((d) =>
    donationFilter === "all" || d.status === donationFilter
  );

  const filteredOrganizations = organizationVerification.filter((org) =>
    orgFilter === "all" || org.status === orgFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
      case "approved":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
      case "under-review":
      case "in-transit":
        return "bg-yellow-100 text-yellow-800";
      case "flagged":
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <span className={`text-sm font-medium ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                </div>
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{user.role}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{user.joinedDate}</td>
                    <td className="py-3 px-4 font-medium">{user.donations}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                        {user.status === "pending" && (
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
                                <AlertDialogAction className="bg-green-600 hover:bg-green-700">Verify</AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {user.status === "verified" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost"><Lock className="w-4 h-4 text-blue-600" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Suspend User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to suspend {user.name}? They will lose platform access.
                              </AlertDialogDescription>
                              <div className="flex justify-end gap-3">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-blue-600 hover:bg-blue-700">Suspend</AlertDialogAction>
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
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="matched">Matched</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Donations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Donor</th>
                  <th className="text-left py-3 px-4 font-semibold">Recipient</th>
                  <th className="text-left py-3 px-4 font-semibold">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium text-primary">{donation.id}</td>
                    <td className="py-3 px-4">{donation.donor}</td>
                    <td className="py-3 px-4">{donation.recipient}</td>
                    <td className="py-3 px-4 font-medium">{donation.quantity}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(donation.status)}>{donation.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{donation.dateCreated}</td>
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
              <p className="text-sm text-muted-foreground">Review and approve organization registrations</p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-4">
            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organizations Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredOrganizations.map((org) => (
              <div key={org.id} className="border border-border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{org.name}</h4>
                    <p className="text-xs text-muted-foreground">{org.type}</p>
                  </div>
                  <Badge className={getStatusColor(org.status)}>{org.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  <p>Submitted: {org.submittedDate}</p>
                  <p>Documents: {org.documents}</p>
                  {org.reason && <p className="text-red-600 mt-1">Reason: {org.reason}</p>}
                </div>
                <div className="flex gap-2">
                  {org.status === "pending" || org.status === "under-review" ? (
                    <>
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1">
                        <XCircle className="w-3 h-3 mr-1" />Reject
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />View Details
                      </Button>
                      <Button size="sm" variant="ghost" className="flex-1">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
