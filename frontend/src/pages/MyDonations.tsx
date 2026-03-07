import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { donationsApi } from "@/lib/offlineApi";
import { Donation } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package, Plus, X, Clock, CheckCircle, Truck, AlertTriangle, Ban, Sparkles,
  History, ChevronDown, ChevronUp,
} from "lucide-react";

// ── Countdown helper ──────────────────────────────────────────────────────────
function useCountdown(deadline?: string) {
  const [now, setNow] = useState(Date.now());
  // Only update if still counting
  if (deadline && new Date(deadline).getTime() > now) {
    setTimeout(() => setNow(Date.now()), 30_000);
  }
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - now;
  if (ms <= 0) return "Overdue";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const STATUS_COLORS: Record<string, string> = {
  REPORTED: "bg-blue-100 text-blue-700",
  MATCHED: "bg-violet-100 text-violet-700",
  ACCEPTED: "bg-cyan-100 text-cyan-700",
  PICKED_UP: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  REPORTED: Package,
  MATCHED: Sparkles,
  ACCEPTED: CheckCircle,
  PICKED_UP: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: Ban,
  EXPIRED: AlertTriangle,
};

const TABS = ["All", "Active", "Delivered", "Cancelled/Expired"];

function DonationRow({ donation, onCancel }: { donation: Donation; onCancel: (id: string) => void }) {
  const navigate = useNavigate();
  const [showLogs, setShowLogs] = useState(false);
  const { data: logs = [] } = useQuery({
    queryKey: ["status-logs", donation.id],
    queryFn: () => donationsApi.statusLogs(donation.id),
    enabled: showLogs,
  });

  const Icon = STATUS_ICONS[donation.status] ?? Package;
  const isActive = !["DELIVERED", "CANCELLED", "EXPIRED"].includes(donation.status);
  const deadline = donation.pickupDeadline;
  const countdown = useCountdown(deadline);

  return (
    <div className="card-elevated p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground capitalize">
              {donation.foodCategory ?? "Food Item"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {donation.organization?.name ?? "—"} ·{" "}
              {donation.quantityKg != null ? `${donation.quantityKg} kg` : "—"}
              {donation.estimatedMeals ? ` · ~${donation.estimatedMeals} meals` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Posted {new Date(donation.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[donation.status]}`}>
            {donation.status}
          </span>
          {countdown && isActive && (
            <span className={`text-[11px] font-medium flex items-center gap-1 ${countdown === "Overdue" ? "text-destructive" : "text-amber-600"}`}>
              <Clock className="w-3 h-3" /> {countdown}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="default"
          className="h-7 text-xs"
          onClick={() => navigate(`/donations/${donation.id}`)}
        >
          <Package className="w-3 h-3 mr-1" /> View Details
        </Button>
        {isActive && (
          <Button
            size="sm"
            variant="outline"
            className="text-destructive border-destructive/40 hover:bg-destructive/10 h-7 text-xs"
            onClick={() => onCancel(donation.id)}
          >
            <X className="w-3 h-3 mr-1" /> Cancel
          </Button>
        )}
        {(donation.status === "REPORTED" || donation.status === "MATCHED") && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => navigate(`/matches?donation=${donation.id}`)}
          >
            <Sparkles className="w-3 h-3 mr-1" /> View Matches
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => setShowLogs((v) => !v)}
        >
          <History className="w-3 h-3 mr-1" />
          History
          {showLogs ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>
      </div>

      {/* Status History */}
      {showLogs && (
        <div className="bg-muted/50 rounded-xl p-3 text-xs space-y-1.5">
          {logs.length === 0 ? (
            <p className="text-muted-foreground italic">No history available.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium text-foreground">{log.oldStatus || "—"}</span>
                <span>→</span>
                <span className="font-medium text-primary">{log.newStatus}</span>
                <span className="ml-auto">{new Date(log.changedAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const MyDonations = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");

  const { data: allDonations = [], isLoading } = useQuery<Donation[]>({
    queryKey: ["my-donations"],
    queryFn: () => donationsApi.list({ donorId: user?.id }),
    enabled: !!user?.id,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => donationsApi.updateStatus(id, "CANCELLED"),
    onSuccess: () => {
      toast.success("Donation cancelled.");
      queryClient.invalidateQueries({ queryKey: ["my-donations"] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to cancel"),
  });

  const filtered = allDonations.filter((d) => {
    if (activeTab === "Active") return !["DELIVERED", "CANCELLED", "EXPIRED"].includes(d.status);
    if (activeTab === "Delivered") return d.status === "DELIVERED";
    if (activeTab === "Cancelled/Expired") return ["CANCELLED", "EXPIRED"].includes(d.status);
    return true;
  });

  const activeCount = allDonations.filter((d) => !["DELIVERED", "CANCELLED", "EXPIRED"].includes(d.status)).length;
  const deliveredCount = allDonations.filter((d) => d.status === "DELIVERED").length;
  const totalKg = allDonations
    .filter((d) => d.status === "DELIVERED")
    .reduce((s, d) => s + (d.quantityKg ?? 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Donations</h1>
            <p className="text-muted-foreground text-sm mt-1">Track and manage all your food donations</p>
          </div>
          <Button className="self-start sm:self-auto" onClick={() => navigate("/donate")}>
            <Plus className="w-4 h-4 mr-2" /> Post New Donation
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          {[
            { label: "Active", value: activeCount, color: "text-blue-600" },
            { label: "Delivered", value: deliveredCount, color: "text-green-600" },
            { label: "Kg Donated", value: `${totalKg.toFixed(1)} kg`, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="card-elevated p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto scroll-smooth pb-px">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap shrink-0 ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-elevated h-24 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No donations found.</p>
            {activeTab === "All" && (
              <Button className="mt-4" onClick={() => navigate("/donate")}>
                <Plus className="w-4 h-4 mr-2" /> Post Your First Donation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((d) => (
              <DonationRow key={d.id} donation={d} onCancel={(id) => cancelMutation.mutate(id)} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyDonations;
