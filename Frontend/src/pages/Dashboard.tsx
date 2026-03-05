import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatCard from "@/components/shared/StatCard";
import MapWidget from "@/components/shared/MapWidget";
import { dashboardStats, activityFeed, mapMarkers } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Truck } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
            <p className="text-muted-foreground text-sm">Real-time monitoring of food redistribution cycles.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline"><FileText className="w-4 h-4 mr-2" />Export Report</Button>
            <Button><Plus className="w-4 h-4 mr-2" />New Donation</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Map + Activity */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 card-elevated p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-dot" />
                <h3 className="font-semibold text-foreground">Live Redistribution Map</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Donor</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-info" /> NGO</span>
              </div>
            </div>
            <MapWidget markers={mapMarkers} />
            <div className="mt-3 card-elevated p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">ACTIVE LOGISTICS</p>
                <p className="text-sm font-medium text-foreground">TRUCK-728: Delivering to Mission Shelter</p>
              </div>
            </div>
          </div>

          <div className="card-elevated p-5">
            <h3 className="font-semibold text-foreground mb-1">Live Activity</h3>
            <p className="text-xs text-muted-foreground mb-4">Real-time matching updates</p>
            <div className="space-y-5">
              {activityFeed.map((item, i) => (
                <div key={i} className="flex gap-3 animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    item.color === "primary" ? "bg-primary" : item.color === "info" ? "bg-info" : "bg-muted-foreground/30"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{item.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    {item.type === "match" && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="h-7 text-xs">Review</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs">Ignore</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto text-primary text-sm">View All Activity</Button>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="card-elevated p-4 max-w-xs">
          <p className="text-xs font-semibold text-primary uppercase mb-2">Weekly Goal</p>
          <div className="w-full bg-muted rounded-full h-2 mb-1">
            <div className="bg-primary h-2 rounded-full" style={{ width: "72%" }} />
          </div>
          <p className="text-xs text-muted-foreground">7,240kg of 10,000kg saved</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
