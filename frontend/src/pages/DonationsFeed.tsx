import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatusBadge from "@/components/shared/StatusBadge";
import QRScanner from "@/components/qr/QRScanner";
import { donationsApi, matchesApi, deliveriesApi } from "@/lib/offlineApi";
import { Donation, Match, Delivery } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Plus, Package, MapPin, X, Check, Truck, ClipboardList, Search, Star, Clock, Scan, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import foodBakery from "@/assets/food-bakery.jpg";
import foodProduce from "@/assets/food-produce.jpg";
import foodDairy from "@/assets/food-dairy.jpg";
import foodDeli from "@/assets/food-deli.jpg";
import foodGrains from "@/assets/food-grains.jpg";
import foodMeals from "@/assets/food-meals.jpg";

const imageMap: Record<string, string> = {
  bakery: foodBakery, produce: foodProduce, dairy: foodDairy,
  deli: foodDeli, grains: foodGrains, meals: foodMeals,
};

const categories = ["All Items", "Urgent", "Fresh Produce", "Bakery", "Dairy"];

function deriveUrgency(expiryTime?: string): "urgent" | "moderate" | "low" {
  if (!expiryTime) return "low";
  const hrs = (new Date(expiryTime).getTime() - Date.now()) / 36e5;
  if (hrs < 12) return "urgent";
  if (hrs < 24) return "moderate";
  return "low";
}

function resolveImage(foodCategory?: string): string {
  const cat = (foodCategory ?? "").toLowerCase();
  if (cat.includes("bak")) return "bakery";
  if (cat.includes("produc") || cat.includes("veg") || cat.includes("fruit")) return "produce";
  if (cat.includes("dairy") || cat.includes("milk")) return "dairy";
  if (cat.includes("deli") || cat.includes("meat")) return "deli";
  if (cat.includes("grain") || cat.includes("bread") || cat.includes("rice")) return "grains";
  return "meals";
}

function countdownLabel(deadline?: string): string | null {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return "Overdue";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 48) return null; // don't show for far-future deadlines
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

const DonationsFeed = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchText, setSearchText] = useState(() => searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState("Open");

  // Keep local state in sync when the URL ?search param changes externally
  // (e.g. navigating here from the navbar search)
  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    setSearchText(urlSearch);
  }, [searchParams]);

  const updateSearch = (value: string) => {
    setSearchText(value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value.trim()) {
        next.set("search", value);
      } else {
        next.delete("search");
      }
      return next;
    }, { replace: true });
  };
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { data: donationsData, isLoading } = useQuery({
    queryKey: ["donations"],
    queryFn: () => donationsApi.list(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => donationsApi.updateStatus(id, "CANCELLED"),
    onSuccess: () => {
      toast.success("Donation cancelled.");
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to cancel"),
  });

  // ── Recipient: fetch my matches ──────────────────────────────────────────
  const { data: myMatches = [] } = useQuery<Match[]>({
    queryKey: ["my-matches"],
    queryFn: () => matchesApi.getMyMatches(),
    enabled: user?.role === "RECIPIENT",
  });

  const { data: myDeliveries = [] } = useQuery<Delivery[]>({
    queryKey: ["deliveries"],
    queryFn: deliveriesApi.list,
    enabled: user?.role === "RECIPIENT",
  });

  // Build donationId → deliveryId map
  const deliveryIdByDonation = Object.fromEntries(
    (myDeliveries as Delivery[]).map((d) => [d.donationId, d.id])
  );

  const acceptMatchMutation = useMutation({
    mutationFn: (matchId: string) => matchesApi.accept(matchId),
    onSuccess: () => {
      toast.success("Match accepted! Head over to pick it up.");
      queryClient.invalidateQueries({ queryKey: ["my-matches"] });
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to accept match"),
  });

  const rejectMatchMutation = useMutation({
    mutationFn: (matchId: string) => matchesApi.reject(matchId),
    onSuccess: () => {
      toast.info("Match rejected.");
      queryClient.invalidateQueries({ queryKey: ["my-matches"] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to reject match"),
  });

  const startPickupMutation = useMutation({
    mutationFn: (donationId: string) => deliveriesApi.start(donationId),
    onSuccess: (delivery) => {
      toast.success("Pickup started! Track your delivery.");
      queryClient.invalidateQueries({ queryKey: ["my-matches"] });
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      navigate(`/delivery/${delivery.id}`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to start pickup"),
  });

  const confirmQRPickupMutation = useMutation({
    mutationFn: (qrToken: string) => deliveriesApi.confirmPickupByQR(qrToken),
    onSuccess: (delivery) => {
      toast.success("Pickup confirmed via QR code! ✓");
      setShowQRScanner(false);
      queryClient.invalidateQueries({ queryKey: ["my-matches"] });
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      navigate(`/delivery/${delivery.id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "QR confirmation failed");
      setShowQRScanner(false);
    },
  });

  // Segregate matches by action needed
  const pendingMatches = myMatches.filter(
    (m) => m.donation?.status === "MATCHED"
  );
  const acceptedDonations = myMatches.filter(
    (m) => m.selected && m.donation?.status === "ACCEPTED"
  );
  const inTransitDonations = myMatches.filter(
    (m) => m.selected && m.donation?.status === "PICKED_UP"
  );

  const donations: Donation[] = donationsData ?? [];

  const filtered = useMemo(() => {
    let result = donations;
    // Status filter
    if (statusFilter === "Open") result = result.filter(d => !["DELIVERED", "CANCELLED", "EXPIRED"].includes(d.status));
    else if (statusFilter === "Delivered") result = result.filter(d => d.status === "DELIVERED");
    // Category filter
    if (activeCategory !== "All Items") {
      if (activeCategory === "Urgent") result = result.filter(d => deriveUrgency(d.expiryTime) === "urgent");
      else result = result.filter(d => (d.foodCategory ?? "").toLowerCase().includes(activeCategory.toLowerCase()));
    }
    // Search
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(d =>
        (d.foodCategory ?? "").toLowerCase().includes(q) ||
        (d.organization?.name ?? "").toLowerCase().includes(q) ||
        (d.donor?.name ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [donations, activeCategory, searchText, statusFilter]);

  const exportFilteredCSV = useCallback(() => {
    try {
      const headers = ["ID", "Food Category", "Quantity (kg)", "Status", "Donor", "Organisation", "Address", "Expiry Time", "Pickup Deadline", "Created At"];
      const rows = filtered.map((d) => [
        d.id,
        d.foodCategory ?? "",
        d.quantityKg ?? "",
        d.status,
        d.donor?.name ?? "",
        d.organization?.name ?? "",
        d.organization?.address ?? "",
        d.expiryTime ?? "",
        d.pickupDeadline ?? "",
        d.createdAt ?? "",
      ]);
      const escape = (v: unknown) => {
        const s = String(v ?? "");
        return s.includes(",") || s.includes('"') || s.includes("\n")
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      };
      const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donations_filtered_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`CSV exported (${filtered.length} donation${filtered.length !== 1 ? "s" : ""})`);
    } catch {
      toast.error("CSV export failed");
    }
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">

        {/* ── NGO / Recipient Task Panel ────────────────────────────────── */}
        {user?.role === "RECIPIENT" && (pendingMatches.length > 0 || acceptedDonations.length > 0 || inTransitDonations.length > 0) && (
          <div className="mb-8 card-elevated p-5 border border-primary/20">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-primary" />
              Your Action Items
            </h2>

            {/* Pending — waiting for accept/reject */}
            {pendingMatches.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Matched — Awaiting Your Response</p>
                <div className="space-y-3">
                  {pendingMatches.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-4 bg-muted/50 rounded-xl p-4">
                      <div>
                        <p className="font-semibold text-foreground capitalize">
                          {m.donation?.foodCategory ?? "Food Item"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {m.donation?.organization?.name ?? m.donation?.donor?.name ?? "Unknown donor"} ·{" "}
                          {m.distanceKm != null ? `${m.distanceKm.toFixed(1)} km away` : ""}
                        </p>
                        {m.donation?.quantityKg != null && (
                          <p className="text-xs text-muted-foreground">{m.donation.quantityKg} kg</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/40 hover:bg-destructive/10"
                          disabled={rejectMatchMutation.isPending}
                          onClick={() => rejectMatchMutation.mutate(m.id)}
                        >
                          <X className="w-3 h-3 mr-1" />Reject
                        </Button>
                        <Button
                          size="sm"
                          disabled={acceptMatchMutation.isPending}
                          onClick={() => acceptMatchMutation.mutate(m.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted — ready for pickup */}
            {acceptedDonations.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Accepted — Ready for Pickup</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-800 font-medium flex items-center gap-2">
                    <Scan className="w-4 h-4" />
                    Scan the donor's QR code at pickup location to confirm collection
                  </p>
                </div>
                <div className="space-y-3">
                  {acceptedDonations.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-4 bg-muted/50 rounded-xl p-4">
                      <div>
                        <p className="font-semibold text-foreground capitalize">
                          {m.donation?.foodCategory ?? "Food Item"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {m.donation?.organization?.name ?? m.donation?.donor?.name ?? "Unknown donor"} ·{" "}
                          {m.distanceKm != null ? `${m.distanceKm.toFixed(1)} km away` : ""}
                        </p>
                        {m.donation?.pickupDeadline && (
                          <p className="text-xs text-amber-500 mt-0.5">
                            Pickup by: {new Date(m.donation.pickupDeadline).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setShowQRScanner(true)}
                      >
                        <Scan className="w-3 h-3 mr-1" />Scan QR to Pickup
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In-transit — already picked up */}
            {inTransitDonations.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">In Transit — Mark as Delivered</p>
                <div className="space-y-3">
                  {inTransitDonations.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-4 bg-muted/50 rounded-xl p-4">
                      <div>
                        <p className="font-semibold text-foreground capitalize">
                          {m.donation?.foodCategory ?? "Food Item"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {m.donation?.organization?.name ?? m.donation?.donor?.name ?? "Unknown donor"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const deliveryId = m.donation ? deliveryIdByDonation[m.donation.id] : undefined;
                          navigate(deliveryId ? `/delivery/${deliveryId}` : "/delivery");
                        }}
                      >
                        <Truck className="w-3 h-3 mr-1" />Track Delivery
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Surplus Donations Feed</h1>
              <p className="text-muted-foreground text-sm mt-1">AI-powered food redistribution opportunities in your area</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.role === "RECIPIENT" && (
                <Button variant="outline" onClick={() => setShowQRScanner(true)}>
                  <Scan className="w-4 h-4 mr-2" />Scan QR Code
                </Button>
              )}
              {user?.role === "DONOR" && (
                <>
                  <Button variant="outline" onClick={() => {
                    exportFilteredCSV();
                  }}>
                    <Download className="w-4 h-4 mr-2" />Export CSV
                  </Button>
                  <Button onClick={() => navigate("/donate")}>
                    <Plus className="w-4 h-4 mr-2" />Post Donation
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Search + status filter row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-muted rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
              <input
                value={searchText}
                onChange={(e) => updateSearch(e.target.value)}
                placeholder="Search food, org..."
                className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              />
              {searchText && (
                <button onClick={() => updateSearch("")} className="ml-1 text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {["Open", "Delivered", "All"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                cat === activeCategory ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Donation Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-elevated overflow-hidden animate-pulse">
                <div className="h-44 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No donations found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {filtered.map((donation) => {
              const urgency = deriveUrgency(donation.expiryTime);
              const uploadedImage = donation.images?.[0]?.imageUrl;
              const imgUrl = uploadedImage ?? imageMap[resolveImage(donation.foodCategory)];
              const trustScore = donation.donor?.trustScore;
              const cdLabel = countdownLabel(donation.pickupDeadline ?? donation.expiryTime);
              const isOverdue = cdLabel === "Overdue";
              return (
                <div key={donation.id} className="card-elevated-hover overflow-hidden animate-fade-in">
                  <div className="relative h-44 overflow-hidden">
                    <img src={imgUrl} alt={donation.foodCategory ?? "Food"} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <StatusBadge urgency={urgency} />
                    </div>
                    {cdLabel && (
                      <div className={`absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isOverdue ? "bg-destructive text-destructive-foreground" : "bg-amber-500 text-white"
                      }`}>
                        <Clock className="w-2.5 h-2.5" /> {cdLabel}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 capitalize">{donation.foodCategory ?? "Food Item"}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Package className="w-3 h-3" />
                      Qty: {donation.quantityKg != null ? `${donation.quantityKg} kg` : "—"}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {donation.donor?.name ?? donation.organization?.name ?? "Unknown"}
                      </div>
                      {trustScore != null && (
                        <div className="flex items-center gap-0.5 text-[10px] text-warning">
                          <Star className="w-3 h-3 fill-warning" />
                          <span className="font-semibold text-foreground">{trustScore.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex justify-between items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => navigate(`/donations/${donation.id}`)}
                      >
                        <Package className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                      {user?.role === "DONOR" &&
                        donation.status !== "DELIVERED" &&
                        donation.status !== "CANCELLED" &&
                        donation.status !== "EXPIRED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive/90 h-7 px-2 text-xs"
                            onClick={(e) => { e.stopPropagation(); cancelMutation.mutate(donation.id); }}
                            disabled={cancelMutation.isPending}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <Button variant="outline" size="lg">Load More Donations</Button>
        </div>
      </main>
      <Footer />

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScanSuccess={(qrToken) => confirmQRPickupMutation.mutate(qrToken)}
          onClose={() => setShowQRScanner(false)}
          isScanning={confirmQRPickupMutation.isPending}
        />
      )}
    </div>
  );
};

export default DonationsFeed;
