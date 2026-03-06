import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatCard from "@/components/shared/StatCard";
import MapWidget from "@/components/shared/MapWidget";
import QRScanner from "@/components/qr/QRScanner";
import { Button } from "@/components/ui/button";
import {
  Plus, Truck, Package, Handshake, Leaf, Clock,
  CheckCircle, AlertCircle, Sparkles, ArrowRight, Scan,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { impactApi, donationsApi, matchesApi, deliveriesApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Match, Donation, Delivery } from "@/types/api";

/* ─── Donor Dashboard ─────────────────────────────────────────────────────── */
const DonorDashboard = ({ impact, liveMarkers }: { impact: any; liveMarkers: any[] }) => {
  const navigate = useNavigate();
  const { data: myDonations = [] } = useQuery<Donation[]>({
    queryKey: ["my-donations"],
    queryFn: () => donationsApi.list(),
  });

  const active = (myDonations as Donation[]).filter(
    (d) => !["DELIVERED", "CANCELLED", "EXPIRED"].includes(d.status)
  );
  const delivered = (myDonations as Donation[]).filter((d) => d.status === "DELIVERED");

  const stats = [
    { label: "Total KG Saved", value: impact ? `${impact.totalKgSaved.toLocaleString()} kg` : "—", icon: "Package", change: "Platform total", positive: true },
    { label: "Meals Saved",    value: impact ? impact.estimatedMealsSaved.toLocaleString() : "—", icon: "Handshake", change: "Platform total", positive: true },
    { label: "My Active",      value: active.length.toString(), icon: "Clock", change: "Donations", positive: true },
    { label: "My Delivered",   value: delivered.length.toString(), icon: "Leaf", change: "Completed", positive: true },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Donor Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your surplus food donations and track their redistribution.</p>
        </div>
        <Button onClick={() => navigate("/donate")}><Plus className="w-4 h-4 mr-2" />New Donation</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Post a Donation", desc: "List surplus food for NGOs", icon: Plus, path: "/donate", primary: true },
          { label: "View My Donations", desc: "Track status of all listings", icon: Package, path: "/donations", primary: false },
          { label: "AI Matching",  desc: "Run smart recipient matching", icon: Sparkles, path: "/matches", primary: false },
        ].map(({ label, desc, icon: Icon, path, primary }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`card-elevated-hover p-5 text-left flex items-start gap-4 ${primary ? "border border-primary/30" : ""}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${primary ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto self-center" />
          </button>
        ))}
      </div>

      {/* Map + recent donations */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elevated p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-dot" />
            <h3 className="font-semibold text-foreground">Live Redistribution Map</h3>
          </div>
          <MapWidget markers={liveMarkers} />
        </div>
        <div className="card-elevated p-5">
          <h3 className="font-semibold text-foreground mb-4">My Recent Donations</h3>
          {active.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active donations</p>
              <Button size="sm" className="mt-3" onClick={() => navigate("/donate")}>Post One Now</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {active.slice(0, 5).map((d) => (
                <div 
                  key={d.id} 
                  className="flex items-center justify-between gap-2 p-3 bg-muted/40 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors"
                  onClick={() => navigate(`/donations/${d.id}`)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize truncate">{d.foodCategory ?? "Food Item"}</p>
                    <p className="text-xs text-muted-foreground">{d.quantityKg} kg · {d.status}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                    d.status === "REPORTED" ? "bg-muted text-muted-foreground" :
                    d.status === "MATCHED"  ? "bg-amber-100 text-amber-700" :
                    d.status === "ACCEPTED" ? "bg-blue-100 text-blue-700" :
                    "bg-primary/10 text-primary"
                  }`}>{d.status}</span>
                </div>
              ))}
              <Button variant="link" className="p-0 h-auto text-primary text-sm" onClick={() => navigate("/donations")}>
                View all donations <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ─── Recipient Dashboard ─────────────────────────────────────────────────── */
const RecipientDashboard = ({ liveMarkers }: { liveMarkers: any[] }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { data: myMatches = [] } = useQuery<Match[]>({
    queryKey: ["my-matches"],
    queryFn: matchesApi.getMyMatches,
  });

  const { data: myDeliveries = [] } = useQuery<Delivery[]>({
    queryKey: ["deliveries"],
    queryFn: deliveriesApi.list,
  });

  const pending     = (myMatches as Match[]).filter((m) => m.donation?.status === "MATCHED");
  const accepted    = (myMatches as Match[]).filter((m) => m.selected && m.donation?.status === "ACCEPTED");
  const inTransit   = (myMatches as Match[]).filter((m) => m.selected && m.donation?.status === "PICKED_UP");
  const delivered   = (myDeliveries as Delivery[]).filter((d) => d.completed);

  const acceptMutation = useMutation({
    mutationFn: (matchId: string) => matchesApi.accept(matchId),
    onSuccess: () => { toast.success("Accepted!"); queryClient.invalidateQueries({ queryKey: ["my-matches"] }); },
    onError: (err: Error) => toast.error(err.message),
  });
  const rejectMutation = useMutation({
    mutationFn: (matchId: string) => matchesApi.reject(matchId),
    onSuccess: () => { toast.info("Rejected."); queryClient.invalidateQueries({ queryKey: ["my-matches"] }); },
    onError: (err: Error) => toast.error(err.message),
  });
  const startPickupMutation = useMutation({
    mutationFn: (donationId: string) => deliveriesApi.start(donationId),
    onSuccess: (delivery) => {
      toast.success("Pickup started!");
      queryClient.invalidateQueries({ queryKey: ["my-matches"] });
      navigate(`/delivery/${delivery.id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const confirmQRPickupMutation = useMutation({
    mutationFn: (qrToken: string) => deliveriesApi.confirmPickupByQR(qrToken),
    onSuccess: (delivery) => {
      toast.success("Pickup confirmed via QR code! ✓");
      setShowQRScanner(false);
      queryClient.invalidateQueries({ queryKey: ["my-matches"] });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      navigate(`/delivery/${delivery.id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "QR confirmation failed");
      setShowQRScanner(false);
    },
  });

  const stats = [
    { label: "Pending Matches",  value: pending.length.toString(),   icon: "Handshake", change: "Awaiting response", positive: pending.length === 0 },
    { label: "Ready to Pick Up", value: accepted.length.toString(),  icon: "Package",   change: "Accepted",          positive: true },
    { label: "In Transit",       value: inTransit.length.toString(), icon: "Clock",     change: "On the way",        positive: true },
    { label: "Completed",        value: delivered.length.toString(), icon: "Leaf",      change: "Deliveries",        positive: true },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">NGO Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Accept matched donations, coordinate pickups and track deliveries.</p>
        </div>
        <Button onClick={() => navigate("/my-matches")}>
          <Handshake className="w-4 h-4 mr-2" />My Matches
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "My Matches",        desc: "Accept or reject food matches", icon: Handshake, path: "/my-matches",  primary: true, badge: pending.length },
          { label: "Browse Donations",  desc: "See all available surplus food", icon: Package,  path: "/donations",   primary: false, badge: 0 },
          { label: "My Deliveries",     desc: "Track in-progress deliveries",  icon: Truck,    path: "/delivery",    primary: false, badge: inTransit.length },
        ].map(({ label, desc, icon: Icon, path, primary, badge }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`card-elevated-hover p-5 text-left flex items-start gap-4 relative ${primary ? "border border-primary/30" : ""}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${primary ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            {badge > 0 && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                {badge}
              </span>
            )}
            <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto self-center" />
          </button>
        ))}
      </div>

      {/* Pending matches + map */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elevated p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-dot" />
            <h3 className="font-semibold text-foreground">Live Redistribution Map</h3>
          </div>
          <MapWidget markers={liveMarkers} />
        </div>

        <div className="card-elevated p-5">
          <h3 className="font-semibold text-foreground mb-1">Action Required</h3>
          <p className="text-xs text-muted-foreground mb-4">Matches awaiting your response</p>

          {pending.length === 0 && accepted.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">All caught up!</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate("/donations")}>
                Browse Available Food
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 3).map((m) => (
                <div key={m.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-foreground capitalize">{m.donation?.foodCategory ?? "Food Item"}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {m.donation?.quantityKg} kg · {m.distanceKm?.toFixed(1)} km away
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs flex-1" onClick={() => acceptMutation.mutate(m.id)} disabled={acceptMutation.isPending}>
                      <CheckCircle className="w-3 h-3 mr-1" />Accept
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => rejectMutation.mutate(m.id)} disabled={rejectMutation.isPending}>
                      Skip
                    </Button>
                  </div>
                </div>
              ))}
              {accepted.slice(0, 2).map((m) => (
                <div key={m.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-600">Ready for Pickup</p>
                  </div>
                  <p className="text-sm font-medium text-foreground capitalize">{m.donation?.foodCategory ?? "Food Item"}</p>
                  <p className="text-xs text-muted-foreground mb-2">{m.donation?.quantityKg} kg</p>
                  <Button size="sm" className="h-7 text-xs w-full" onClick={() => setShowQRScanner(true)}>
                    <Scan className="w-3 h-3 mr-1" />Scan QR to Pickup
                  </Button>
                </div>
              ))}
              {(pending.length + accepted.length) > 5 && (
                <Button variant="link" className="p-0 h-auto text-primary text-sm" onClick={() => navigate("/my-matches")}>
                  View all <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScanSuccess={(qrToken) => confirmQRPickupMutation.mutate(qrToken)}
          onClose={() => setShowQRScanner(false)}
          isScanning={confirmQRPickupMutation.isPending}
        />
      )}
    </>
  );
};

/* ─── Root Dashboard ──────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();

  const { data: impact } = useQuery({
    queryKey: ["impact-summary"],
    queryFn: impactApi.summary,
  });

  const { data: donations = [] } = useQuery<Donation[]>({
    queryKey: ["donations"],
    queryFn: donationsApi.list,
  });

  const liveMarkers = (donations as Donation[])
    .filter((d) => d.latitude && d.longitude && d.status !== "CANCELLED" && d.status !== "EXPIRED")
    .map((d, i) => ({
      id: i,
      type: "donation",
      name: d.foodCategory ?? "Donation",
      lat: d.latitude!,
      lng: d.longitude!,
      status: d.status,
    }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {user?.role === "RECIPIENT"
          ? <RecipientDashboard liveMarkers={liveMarkers} />
          : <DonorDashboard impact={impact} liveMarkers={liveMarkers} />
        }
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
