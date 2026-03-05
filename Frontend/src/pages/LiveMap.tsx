import Navbar from "@/components/layout/Navbar";
import MapWidget from "@/components/shared/MapWidget";
import { mapMarkers } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, ArrowDown, ArrowUp, Navigation, Search } from "lucide-react";
import { useState } from "react";

const LiveMap = () => {
  const [selectedMarker, setSelectedMarker] = useState<any>(mapMarkers[2]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col lg:flex-row relative">
        {/* Sidebar */}
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
          <MapWidget markers={mapMarkers} onMarkerClick={setSelectedMarker} fullScreen className="rounded-none h-full min-h-[500px]" />

          {/* Search */}
          <div className="absolute top-4 left-4 right-4 lg:left-20 lg:right-auto lg:w-80">
            <div className="bg-card rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input placeholder="Search locations..." className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-3">
            <div className="bg-card rounded-xl shadow-lg px-2 py-1.5 flex items-center gap-1">
              {["All Markers", "Trucks", "Donations"].map((f, i) => (
                <button key={f} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  i === 0 ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}>{f}</button>
              ))}
            </div>
            <div className="bg-card rounded-xl shadow-lg px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> LIVE DELIVERY</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> PENDING DONATION</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> NGO HUB</span>
            </div>
          </div>

          {/* Navigation button */}
          <button className="absolute bottom-4 right-4 w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground">
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Detail Panel */}
        {selectedMarker && (
          <div className="w-full lg:w-80 bg-card border-t lg:border-l lg:border-t-0 border-border p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-primary uppercase">ACTIVE DELIVERY</p>
              <h3 className="text-lg font-bold text-foreground">{selectedMarker.name} - Transit</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                  <ArrowUp className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">PICKUP</p>
                  <p className="text-sm font-medium text-foreground">Artisan Bakery • 1.2km</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowDown className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">DESTINATION</p>
                  <p className="text-sm font-medium text-foreground">St. Mary's Shelter • 4.5km</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-foreground">Progress</p>
                <p className="text-sm font-semibold text-primary">65%</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }} />
              </div>
            </div>
            <Button className="w-full">View Full Route</Button>

            <div className="bg-muted rounded-xl p-4 mt-4">
              <p className="text-xs font-semibold text-primary uppercase mb-3">TODAY'S IMPACT</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Rescued</p>
                  <p className="text-xl font-bold text-foreground">124 <span className="text-sm font-normal">kg</span></p>
                </div>
                <div className="bg-card rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Delivered</p>
                  <p className="text-xl font-bold text-primary">82 <span className="text-sm font-normal">kg</span></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveMap;
