import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, RefreshCw, Star, Package, Mail, Phone, Building2 } from "lucide-react";
import communityKitchen from "@/assets/community-kitchen.jpg";
import { donationsApi, matchesApi } from "@/lib/offlineApi";
import { useAuth } from "@/contexts/AuthContext";
import { Match } from "@/types/api";

const AIMatching = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDonationId, setSelectedDonationId] = useState<string>("");

  const { data: allDonations = [] } = useQuery({
    queryKey: ["my-donations", user?.id],
    queryFn: () => donationsApi.list({ donorId: user?.id }),
    enabled: !!user?.id,
  });

  // Show only donations that are in a state where matches are relevant
  const donations = allDonations.filter(d =>
    d.status === 'REPORTED' || d.status === 'MATCHED'
  );

  const { data: matchesData = [], isLoading: matchesLoading } = useQuery({
    queryKey: ["matches", selectedDonationId],
    queryFn: () => matchesApi.getByDonation(selectedDonationId),
    enabled: !!selectedDonationId,
  });

  const recalculateMutation = useMutation({
    mutationFn: () => matchesApi.generate(selectedDonationId),
    onSuccess: () => {
      toast.success("Matches recalculated!");
      queryClient.invalidateQueries({ queryKey: ["matches", selectedDonationId] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to recalculate"),
  });

  const matches: Match[] = matchesData;
  const topMatch = matches[0];
  const otherMatches = matches.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3" /> POWERED BY SURPLUSAI
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">AI Smart Matching</h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-lg">
              Optimization algorithms connecting your surplus directly to those in need based on real-time urgency, capacity, and proximity.
            </p>
          </div>
          <Button
            className="self-start sm:self-auto shrink-0"
            onClick={() => selectedDonationId && recalculateMutation.mutate()}
            disabled={!selectedDonationId || recalculateMutation.isPending}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {recalculateMutation.isPending ? "Recalculating..." : "Recalculate Matches"}
          </Button>
        </div>

        {/* Donation Selector */}
        <div className="mt-6 mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-medium text-foreground whitespace-nowrap shrink-0">Select Donation:</label>
          <select
            value={selectedDonationId}
            onChange={(e) => setSelectedDonationId(e.target.value)}
            className="bg-muted rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 w-full sm:min-w-[260px] sm:max-w-sm"
          >
            <option value="">— Choose a donation —</option>
            {donations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.foodCategory ?? "Food Item"} — {d.quantityKg != null ? `${d.quantityKg} kg` : "qty unknown"} [{d.status}]
              </option>
            ))}
          </select>
          {selectedDonationId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/donations/${selectedDonationId}`)}
            >
              <Package className="w-4 h-4 mr-2" />
              View Donation Details
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-2 mb-8 border-b border-border">
          {["Best Matches", "Near You", "High Urgency"].map((tab, i) => (
            <button key={tab} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              i === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>{tab}</button>
          ))}
        </div>

        {!selectedDonationId ? (
          <div className="text-center py-16 text-muted-foreground">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Select a donation above to view AI-generated matches.</p>
          </div>
        ) : matchesLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-elevated p-6 animate-pulse h-24" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No matches yet. Click "Recalculate Matches" to generate them.</p>
          </div>
        ) : (
          <>
            {/* Top Match */}
            {topMatch && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" /> Recommended Pick
                </h2>
                <div className="card-elevated p-0 overflow-hidden">
                  <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    <div className="relative h-64 md:h-auto">
                      <img src={communityKitchen} alt={topMatch.recipient?.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 badge-info">TOP MATCH</span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{topMatch.recipient?.name ?? "Recipient"}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {topMatch.distanceKm != null ? `${topMatch.distanceKm.toFixed(1)} km away` : "Distance unknown"}
                          </p>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center bg-card">
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">
                              {Math.round((topMatch.predictedSuccessProbability ?? 0) * 100)}%
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase">MATCH</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                        {[
                          { label: "CAPACITY FIT", value: `${Math.round((topMatch.capacityFitScore ?? 0) * 100)}%`, icon: "📦" },
                          { label: "TRUST SCORE", value: `${(topMatch.recipient?.trustScore ?? 0).toFixed(1)}/5`, icon: "🛡️" },
                          { label: "URGENCY", value: `${Math.round((topMatch.urgencyScore ?? 0) * 100)}%`, icon: "🕐" },
                          { label: "DISTANCE", value: topMatch.distanceKm != null ? `${topMatch.distanceKm.toFixed(1)} km` : "—", icon: "📍" },
                        ].map(({ label, value, icon }) => (
                          <div key={label} className="bg-muted rounded-xl p-3">
                            <p className="text-[10px] font-semibold text-primary uppercase">{label}</p>
                            <p className="text-sm font-semibold text-foreground mt-1">{icon} {value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border pt-4 mt-2">
                        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Contact Information</p>
                        <div className="space-y-1.5 text-sm text-muted-foreground">
                          {topMatch.recipient?.organization?.name && (
                            <p className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 shrink-0" />
                              {topMatch.recipient.organization.name}
                              {topMatch.recipient.organization.type && (
                                <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] uppercase font-semibold">{topMatch.recipient.organization.type}</span>
                              )}
                            </p>
                          )}
                          {topMatch.recipient?.email && (
                            <p className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              <a href={`mailto:${topMatch.recipient.email}`} className="underline hover:text-foreground">{topMatch.recipient.email}</a>
                            </p>
                          )}
                          {topMatch.recipient?.phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              {topMatch.recipient.phone}
                            </p>
                          )}
                          {topMatch.recipient?.organization?.address && (
                            <p className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              {topMatch.recipient.organization.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* More Matches */}
            {otherMatches.length > 0 && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" /> More Intelligent Matches
                  </h2>
                  <Button variant="link" className="text-primary p-0 h-auto">View All</Button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {otherMatches.map((match) => (
                    <div key={match.id} className="card-elevated-hover p-5 animate-fade-in">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-primary">
                          {(match.recipient?.name ?? "?").charAt(0)}
                        </div>
                        <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {Math.round((match.predictedSuccessProbability ?? 0) * 100)}%
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{match.recipient?.name ?? "Recipient"}</h3>
                      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {match.distanceKm != null ? `${match.distanceKm.toFixed(1)} km` : "—"}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground uppercase">
                          TRUST {(match.recipient?.trustScore ?? 0).toFixed(1)}
                        </span>
                      </div>
                      <div className="border-t border-border pt-3 space-y-1 text-xs text-muted-foreground">
                        {match.recipient?.organization?.name && (
                          <p className="flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 shrink-0" />
                            {match.recipient.organization.name}
                          </p>
                        )}
                        {match.recipient?.email && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 shrink-0" />
                            <a href={`mailto:${match.recipient.email}`} className="underline hover:text-foreground truncate">{match.recipient.email}</a>
                          </p>
                        )}
                        {match.recipient?.phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 shrink-0" />
                            {match.recipient.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AIMatching;
