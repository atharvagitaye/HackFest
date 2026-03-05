import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { matchesApi, deliveriesApi } from "@/lib/api";
import { Match, Delivery } from "@/types/api";
import {
  Handshake, Check, X, Truck, Package, MapPin,
  Clock, CheckCircle, Star, AlertCircle, Timer
} from "lucide-react";

const STATUS_ORDER = ["MATCHED", "ACCEPTED", "PICKED_UP", "DELIVERED", "CANCELLED", "EXPIRED"];

const statusLabel: Record<string, string> = {
  MATCHED: "Awaiting Your Response",
  ACCEPTED: "Accepted — Ready for Pickup",
  PICKED_UP: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const statusColor: Record<string, string> = {
  MATCHED: "text-amber-500 bg-amber-50 border-amber-200",
  ACCEPTED: "text-primary bg-primary/10 border-primary/20",
  PICKED_UP: "text-blue-600 bg-blue-50 border-blue-200",
  DELIVERED: "text-green-600 bg-green-50 border-green-200",
  CANCELLED: "text-destructive bg-destructive/10 border-destructive/20",
  EXPIRED: "text-muted-foreground bg-muted border-border",
};

const TABS = ["All", "Pending", "Accepted", "In Transit", "Completed"];

const tabFilter = (tab: string, matches: Match[]): Match[] => {
  switch (tab) {
    case "Pending":   return matches.filter(m => m.donation?.status === "MATCHED");
    case "Accepted":  return matches.filter(m => m.donation?.status === "ACCEPTED");
    case "In Transit":return matches.filter(m => m.donation?.status === "PICKED_UP");
    case "Completed": return matches.filter(m => ["DELIVERED","CANCELLED","EXPIRED"].includes(m.donation?.status ?? ""));
    default:          return matches;
  }
};

const RecipientMatches = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("All");

  const { data: allMatches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["my-matches"],
    queryFn: () => matchesApi.getMyMatches(),
  });

  const { data: myDeliveries = [] } = useQuery<Delivery[]>({
    queryKey: ["deliveries"],
    queryFn: deliveriesApi.list,
  });

  // Build donationId → deliveryId map for quick lookup
  const deliveryIdByDonation = Object.fromEntries(
    (myDeliveries as Delivery[]).map((d) => [d.donationId, d.id])
  );

  const acceptMutation = useMutation({
    mutationFn: (matchId: string) => matchesApi.accept(matchId),
    onSuccess: () => {
      toast.success("Match accepted! Go ahead and pick it up.");
      queryClient.invalidateQueries({ queryKey: ["my-matches"] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to accept"),
  });

  const rejectMutation = useMutation({
    mutationFn: (matchId: string) => matchesApi.reject(matchId),
    onSuccess: () => {
      toast.info("Match rejected.");
      queryClient.invalidateQueries({ queryKey: ["my-matches"] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to reject"),
  });

  const startPickupMutation = useMutation({
    mutationFn: (donationId: string) => deliveriesApi.start(donationId),
    onSuccess: (delivery) => {
      toast.success("Pickup started! Tracking your delivery.");
      queryClient.invalidateQueries({ queryKey: ["my-matches"] });
      navigate(`/delivery/${delivery.id}`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to start pickup"),
  });

  const visibleMatches = tabFilter(activeTab, allMatches);

  // Counts for tab badges
  const pendingCount = allMatches.filter(m => m.donation?.status === "MATCHED").length;
  const acceptedCount = allMatches.filter(m => m.donation?.status === "ACCEPTED").length;
  const inTransitCount = allMatches.filter(m => m.donation?.status === "PICKED_UP").length;

  const tabCounts: Record<string, number> = {
    Pending: pendingCount,
    Accepted: acceptedCount,
    "In Transit": inTransitCount,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Handshake className="w-8 h-8 text-primary" />
            My Matched Donations
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Donations matched to your organisation — accept, pick up, and confirm delivery.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Awaiting Response", count: pendingCount, icon: AlertCircle, color: "text-amber-500" },
            { label: "Ready for Pickup",  count: acceptedCount, icon: Package, color: "text-primary" },
            { label: "In Transit",        count: inTransitCount, icon: Truck, color: "text-blue-500" },
            { label: "Total Matched",     count: allMatches.length, icon: Star, color: "text-green-500" },
          ].map(({ label, count, icon: Icon, color }) => (
            <div key={label} className="card-elevated p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === activeTab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {tabCounts[tab] ? (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-primary text-primary-foreground font-semibold">
                  {tabCounts[tab]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Match list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-elevated h-28 animate-pulse" />
            ))}
          </div>
        ) : visibleMatches.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Handshake className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No matches yet</p>
            <p className="text-sm mt-1">
              {activeTab === "All"
                ? "When donors run AI matching, you'll appear here if you're a nearby organisation."
                : `No matches in the "${activeTab}" category.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleMatches.map((m) => {
              const status = m.donation?.status ?? "MATCHED";
              const colorClass = statusColor[status] ?? statusColor.EXPIRED;
              const isActionable = !acceptMutation.isPending && !rejectMutation.isPending && !startPickupMutation.isPending;

              return (
                <div key={m.id} className="card-elevated p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Left: info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                          {statusLabel[status] ?? status}
                        </span>
                        {m.predictedSuccessProbability != null && (
                          <span className="text-xs text-muted-foreground">
                            AI Score: {Math.round(m.predictedSuccessProbability * 100)}%
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-foreground capitalize truncate">
                        {m.donation?.foodCategory ?? "Food Item"}
                      </h3>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        {m.donation?.organization?.name || m.donation?.donor?.name ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {m.donation.organization?.name ?? m.donation.donor?.name}
                          </span>
                        ) : null}
                        {m.donation?.quantityKg != null && (
                          <span className="flex items-center gap-1">
                            <Package className="w-3.5 h-3.5" />
                            {m.donation.quantityKg} kg · ~{m.donation.estimatedMeals ?? "?"} meals
                          </span>
                        )}
                        {m.distanceKm != null && (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            {m.distanceKm.toFixed(1)} km away
                          </span>
                        )}
                        {m.donation?.pickupDeadline && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Timer className="w-3.5 h-3.5" />
                            Pickup by: {new Date(m.donation.pickupDeadline).toLocaleString()}
                          </span>
                        )}
                        {m.donation?.expiryTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Expires: {new Date(m.donation.expiryTime).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {status === "MATCHED" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/40 hover:bg-destructive/10"
                            disabled={!isActionable}
                            onClick={() => rejectMutation.mutate(m.id)}
                          >
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            disabled={!isActionable}
                            onClick={() => acceptMutation.mutate(m.id)}
                          >
                            <Check className="w-4 h-4 mr-1" /> Accept
                          </Button>
                        </>
                      )}

                      {status === "ACCEPTED" && (
                        <Button
                          size="sm"
                          disabled={!isActionable}
                          onClick={() => m.donation && startPickupMutation.mutate(m.donation.id)}
                        >
                          <Truck className="w-4 h-4 mr-1" /> Mark Picked Up
                        </Button>
                      )}

                      {status === "PICKED_UP" && (() => {
                        const deliveryId = m.donation ? deliveryIdByDonation[m.donation.id] : undefined;
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deliveryId ? navigate(`/delivery/${deliveryId}`) : navigate("/delivery")}
                          >
                            <Truck className="w-4 h-4 mr-1" /> Track & Complete
                          </Button>
                        );
                      })()}

                      {status === "DELIVERED" && (
                        <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4" /> Delivered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RecipientMatches;
