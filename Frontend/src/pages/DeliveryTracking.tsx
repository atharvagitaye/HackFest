import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MapWidget from "@/components/shared/MapWidget";
import RatingModal from "@/components/shared/RatingModal";
import QRCodeDisplay from "@/components/qr/QRCodeDisplay";
import { Button } from "@/components/ui/button";
import { deliveriesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Headphones, Share2, Star, Truck, Package, Sparkles,
  Megaphone, Handshake, CheckCircle, Clock,
} from "lucide-react";
import { Delivery } from "@/types/api";

function buildTimeline(donation?: Delivery["donation"]) {
  const steps = [
    { key: "REPORTED", step: "Reported", icon: Megaphone },
    { key: "MATCHED", step: "Matched", icon: Handshake },
    { key: "ACCEPTED", step: "Accepted", icon: CheckCircle },
    { key: "PICKED_UP", step: "Picked Up", icon: Package },
    { key: "DELIVERED", step: "Delivered", icon: Truck },
  ];
  const order = ["REPORTED", "MATCHED", "ACCEPTED", "PICKED_UP", "DELIVERED"];
  const current = donation?.status ?? "REPORTED";
  const currentIdx = order.indexOf(current);
  return steps.map((s, i) => ({
    ...s,
    completed: i < currentIdx,
    active: i === currentIdx,
  }));
}

const DeliveryTracking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showRating, setShowRating] = useState(false);

  /* ── List mode (no id) ── */
  const { data: deliveries = [], isLoading: listLoading } = useQuery({
    queryKey: ["deliveries"],
    queryFn: deliveriesApi.list,
    enabled: !id,
  });

  /* ── Detail mode (with id) ── */
  const { data: delivery, isLoading: detailLoading } = useQuery<Delivery>({
    queryKey: ["delivery", id],
    queryFn: () => deliveriesApi.getById(id!),
    enabled: !!id,
  });

  const completeMutation = useMutation({
    mutationFn: () => deliveriesApi.complete(id!),
    onSuccess: () => {
      toast.success("Delivery completed!");
      queryClient.invalidateQueries({ queryKey: ["delivery", id] });
      setShowRating(true);
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to complete"),
  });

  /* ── List view ── */
  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">My Deliveries</h1>
          {listLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-elevated h-24 animate-pulse" />
              ))}
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No deliveries yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((d) => (
                <div key={d.id} className="card-elevated-hover p-5 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {user?.role === 'DONOR' 
                        ? `Delivery to ${d.recipient?.name ?? 'Recipient'}`
                        : (d.donation?.organization?.name ?? d.donation?.foodCategory ?? "Delivery")
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {d.donation?.foodCategory && `${d.donation.foodCategory} · `}
                      {d.donation?.quantityKg && `${d.donation.quantityKg} kg · `}
                      {d.completed ? "Completed" : (d.status ?? "In Progress")} ·{" "}
                      {d.pickupTime ? new Date(d.pickupTime).toLocaleString() : "Pending"}
                    </p>
                    {d.qrConfirmedAt && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> QR Confirmed at {new Date(d.qrConfirmedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/delivery/${d.id}`)}>
                    Track
                  </Button>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Detail view ── */
  if (detailLoading || !delivery) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-elevated h-24 animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const timeline = buildTimeline(delivery.donation);
  const canComplete =
    delivery.donation?.status === "PICKED_UP" && !delivery.completed && user?.role === "RECIPIENT";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {showRating && delivery.donation && (
        <RatingModal
          donationId={delivery.donationId}
          toUser={delivery.donation.donor?.id ?? ""}
          toUserName={delivery.donation.donor?.name ?? "Donor"}
          onClose={() => setShowRating(false)}
        />
      )}
      <main className="container py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/delivery")}>Deliveries</span>
          <span>›</span>
          <span className="text-primary">Delivery Tracking</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Delivery Tracking</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`badge-info ${delivery.completed ? "bg-primary/10 text-primary" : ""}`}>
                {delivery.completed ? "COMPLETED" : "ACTIVE"}
              </span>
              <span className="text-sm text-muted-foreground">ID: #{id?.slice(0, 8)} · Surplus Redistribution</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline"><Headphones className="w-4 h-4 mr-2" />Support</Button>
            {canComplete && (
              <Button
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {completeMutation.isPending ? "Completing..." : "Mark Delivered"}
              </Button>
            )}
            {delivery.completed && !showRating && (
              <Button variant="outline" onClick={() => setShowRating(true)}>
                <Star className="w-4 h-4 mr-2" />Rate Donation
              </Button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex items-center justify-between">
            {timeline.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="flex-1 flex flex-col items-center relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    step.completed
                      ? "bg-primary text-primary-foreground"
                      : step.active
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className={`text-sm font-medium ${step.active ? "text-primary" : "text-foreground"}`}>{step.step}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.completed ? "Done" : step.active ? "Current" : "Pending"}
                  </p>
                  {i < timeline.length - 1 && (
                    <div className={`absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-0.5 ${
                      step.completed ? "bg-primary" : "bg-border"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map + Details */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
          <div className="card-elevated p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-primary uppercase">LIVE LOCATION</span>
            </div>
            <MapWidget markers={[]} />
          </div>

          <div className="space-y-4">
            {/* Consignment */}
            <div className="card-elevated p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-primary" /> Consignment
              </h3>
              <div className="bg-muted rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-primary uppercase mb-1">FOOD</p>
                <p className="text-sm text-foreground capitalize">
                  {delivery.donation?.foodCategory ?? "—"} ·{" "}
                  {delivery.donation?.quantityKg != null ? `${delivery.donation.quantityKg} kg` : "—"}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-primary uppercase font-semibold">DONOR</p>
                  <p className="text-foreground font-medium">{delivery.donation?.donor?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-primary uppercase font-semibold">RECIPIENT</p>
                  <p className="text-foreground font-medium">{delivery.recipient?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-primary uppercase font-semibold">ORGANIZATION</p>
                  <p className="text-foreground font-medium">{delivery.donation?.organization?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-primary uppercase font-semibold">EXPIRY</p>
                  <p className="text-foreground font-medium">
                    {delivery.donation?.expiryTime
                      ? new Date(delivery.donation.expiryTime).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code for Pickup - Show to DONOR */}
            {user?.role === 'DONOR' && delivery.qrToken && delivery.donation?.status !== 'DELIVERED' && (
              <QRCodeDisplay
                qrToken={delivery.qrToken}
                donationInfo={{
                  foodType: delivery.donation?.foodCategory ?? 'Food Donation',
                  quantity: delivery.donation?.quantityKg != null ? `${delivery.donation.quantityKg} kg` : 'N/A',
                  pickupLocation: delivery.donation?.pickupLocation ?? 'TBD',
                }}
              />
            )}

            {/* Timing */}
            <div className="card-elevated p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" /> Timing
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup Time</span>
                  <span className="font-medium text-foreground">
                    {delivery.pickupTime ? new Date(delivery.pickupTime).toLocaleString() : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivered At</span>
                  <span className="font-medium text-foreground">
                    {delivery.deliveryTime ? new Date(delivery.deliveryTime).toLocaleString() : "—"}
                  </span>
                </div>
                {delivery.delayMinutes != null && delivery.delayMinutes > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delay</span>
                    <span className="font-medium text-destructive">{delivery.delayMinutes} min late</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-primary rounded-xl p-5 text-primary-foreground">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" /> AI INSIGHT
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {delivery.completed
                  ? "Delivery complete. Great work reducing food waste in your community!"
                  : "Delivery is tracked in real time. Our AI optimizes routes to minimize CO₂ emissions."}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeliveryTracking;

