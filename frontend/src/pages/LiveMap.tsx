import Navbar from "@/components/layout/Navbar";
import MapWidget from "@/components/shared/MapWidget";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, ArrowDown, ArrowUp, Navigation, Search, Package, Clock, Star } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { donationsApi } from "@/lib/offlineApi";
import { Donation } from "@/types/api";

function countdownLabel(deadline?: string): string | null {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return "Overdue";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

const STATUS_COLOR: Record<string, string> = {
  REPORTED: "bg-blue-500",
  MATCHED: "bg-violet-500",
  ACCEPTED: "bg-cyan-500",
  PICKED_UP: "bg-amber-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-400",
  EXPIRED: "bg-gray-400",
};

const LiveMap = () => {
  const { data: donations = [] } = useQuery<Donation[]>({
    queryKey: ["donations"],
    queryFn: () => donationsApi.list(),
  });

  // Convert donations with coordinates to markers
  const mapMarkers = donations
    .filter((d) => d.latitude && d.longitude && d.status !== "CANCELLED" && d.status !== "EXPIRED")
    .map((d, i) => ({
      id: i,
      donationId: d.id,
      type: "donation",
      name: d.foodCategory ?? "Donation",
      lat: d.latitude!,
      lng: d.longitude!,
      status: d.status,
    }));

  const [selectedMarker, setSelectedMarker] = useState<typeof mapMarkers[0] | null>(mapMarkers[0] ?? null);

  const selectedDonation: Donation | undefined = selectedMarker
    ? donations.find((d) => d.id === selectedMarker.donationId)
    : undefined;

  const [filterStatus, setFilterStatus] = useState<string>("All");
  const filteredMarkers = filterStatus === "All"
    ? mapMarkers
    : mapMarkers.filter((m) => m.status === filterStatus);

  const urgentCount = donations.filter((d) => {
    if (!d.expiryTime) return false;
    return (new Date(d.expiryTime).getTime() - Date.now()) < 12 * 3600000 && !["DELIVERED","CANCELLED","EXPIRED"].includes(d.status);
  }).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col lg:flex-row relative">
        {/* Sidebar icons */}
        <div className="w-full lg:w-16 bg-card border-b lg:border-r lg:border-b-0 border-border flex lg:flex-col items-center p-2 gap-2">
          {["grid", "clock", "clipboard", "users"].map((icon, i) => (
            <button key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}>
              <span className="text-xs">■</span>
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapWidget markers={filteredMarkers} onMarkerClick={setSelectedMarker} fullScreen className="rounded-none h-full min-h-[500px]" />

          {/* Search */}
          <div className="absolute top-4 left-4 right-4 lg:left-20 lg:right-auto lg:w-80">
            <div className="bg-card rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input placeholder="Search locations..." className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-3 flex-wrap">
            <div className="bg-card rounded-xl shadow-lg px-2 py-1.5 flex items-center gap-1">
              {["All", "REPORTED", "MATCHED", "PICKED_UP"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === f ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {f === "All" ? "All Markers" : f}
                </button>
              ))}
            </div>
            <div className="bg-card rounded-xl shadow-lg px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> PICKED UP</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> MATCHED</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> REPORTED</span>
              {urgentCount > 0 && (
                <span className="flex items-center gap-1 text-destructive font-semibold"><Clock className="w-3 h-3" /> {urgentCount} urgent</span>
              )}
            </div>
          </div>

          {/* Navigation button */}
          <button className="absolute bottom-4 right-4 w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground">
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Detail Panel */}
        {selectedDonation ? (
          <div className="w-full lg:w-80 bg-card border-t lg:border-l lg:border-t-0 border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${STATUS_COLOR[selectedDonation.status] ?? "bg-gray-400"}`} />
              <p className="text-xs font-semibold text-primary uppercase">{selectedDonation.status}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground capitalize">{selectedDonation.foodCategory ?? "Food Item"}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {selectedDonation.organization?.name ?? selectedDonation.donor?.name ?? "—"}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  {selectedDonation.quantityKg != null ? `${selectedDonation.quantityKg} kg` : "—"}
                  {selectedDonation.estimatedMeals ? ` · ~${selectedDonation.estimatedMeals} meals` : ""}
                </span>
              </div>
              {selectedDonation.latitude && selectedDonation.longitude && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedDonation.latitude.toFixed(4)}, {selectedDonation.longitude.toFixed(4)}</span>
                </div>
              )}
              {selectedDonation.expiryTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className={countdownLabel(selectedDonation.expiryTime) === "Overdue" ? "text-destructive font-medium" : "text-amber-600"}>
                    {`Expires: ${new Date(selectedDonation.expiryTime).toLocaleString()}`}
                    {countdownLabel(selectedDonation.expiryTime) && ` (${countdownLabel(selectedDonation.expiryTime)})`}
                  </span>
                </div>
              )}
              {selectedDonation.donor?.trustScore != null && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-4 h-4 text-warning" />
                  <span>Donor trust: <strong className="text-foreground">{selectedDonation.donor.trustScore.toFixed(2)}</strong></span>
                </div>
              )}
            </div>

            {selectedDonation.images?.[0]?.imageUrl && (
              <img
                src={selectedDonation.images[0].imageUrl}
                alt={selectedDonation.foodCategory ?? ""}
                className="w-full h-32 object-cover rounded-xl"
              />
            )}

            <div className="bg-muted rounded-xl p-4">
              <p className="text-xs font-semibold text-primary uppercase mb-3">PLATFORM STATS TODAY</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Active Donations</p>
                  <p className="text-xl font-bold text-foreground">{mapMarkers.length}</p>
                </div>
                <div className="bg-card rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Urgent</p>
                  <p className="text-xl font-bold text-destructive">{urgentCount}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-80 bg-card border-t lg:border-l lg:border-t-0 border-border p-5 flex flex-col items-center justify-center text-center text-muted-foreground">
            <MapPin className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">Click a marker on the map to see donation details.</p>
            <p className="text-xs mt-1">{mapMarkers.length} active donation{mapMarkers.length !== 1 ? "s" : ""} visible.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveMap;
