import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { deliveryTimeline } from "@/data/mockData";
import MapWidget from "@/components/shared/MapWidget";
import { Button } from "@/components/ui/button";
import { Headphones, Share2, Phone, MessageSquare, Star, Truck, Package, Sparkles, Megaphone, Handshake, CheckCircle } from "lucide-react";

const iconMap: Record<string, React.ElementType> = { Megaphone, Handshake, CheckCircle, Package, Truck };

const DeliveryTracking = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>Dashboard</span><span>›</span><span className="text-primary">Delivery Tracking</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Delivery Tracking</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="badge-info">ACTIVE</span>
              <span className="text-sm text-muted-foreground">ID: #SS-9842 • Surplus Redistribution Progress</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline"><Headphones className="w-4 h-4 mr-2" />Support</Button>
            <Button><Share2 className="w-4 h-4 mr-2" />Share Link</Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex items-center justify-between">
            {deliveryTimeline.map((step, i) => {
              const Icon = iconMap[step.icon] || Package;
              return (
                <div key={step.step} className="flex-1 flex flex-col items-center relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    step.completed ? "bg-primary text-primary-foreground" : step.active ? "bg-primary/20 text-primary border-2 border-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className={`text-sm font-medium ${step.active ? "text-primary" : "text-foreground"}`}>{step.step}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.time}</p>
                  {i < deliveryTimeline.length - 1 && (
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
              <span className="text-sm text-foreground">2.4 miles to Destination</span>
            </div>
            <MapWidget markers={[]} />
          </div>

          <div className="space-y-4">
            {/* Volunteer */}
            <div className="card-elevated p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-primary" /> Volunteer Details
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">MR</div>
                <div>
                  <p className="font-semibold text-foreground">Marcus Richardson</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning fill-warning" /> 4.9 <span className="text-muted-foreground">(128 deliveries)</span>
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Vehicle Type</span><span className="text-foreground font-medium">EV Delivery Van</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Plate Number</span><span className="text-foreground font-medium">ECO-442-91</span></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1"><Phone className="w-4 h-4 mr-1" />Call</Button>
                <Button variant="outline" className="flex-1"><MessageSquare className="w-4 h-4 mr-1" />Message</Button>
              </div>
            </div>

            {/* Consignment */}
            <div className="card-elevated p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-primary" /> Consignment
              </h3>
              <div className="bg-muted rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-primary uppercase mb-1">ITEMS</p>
                <p className="text-sm text-foreground">50 Prepared Meals (Vegetarian)</p>
                <p className="text-sm text-foreground">12kg Fresh Produce Bag</p>
              </div>
              <div className="space-y-2 text-sm">
                <div><p className="text-xs text-primary uppercase font-semibold">PICK UP LOCATION</p><p className="text-foreground font-medium">The Green Bistro • Downtown</p></div>
                <div><p className="text-xs text-primary uppercase font-semibold">DESTINATION</p><p className="text-foreground font-medium">Hope Community Shelter • East Side</p></div>
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-primary rounded-xl p-5 text-primary-foreground">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" /> AI INSIGHT
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                Delivery is currently tracking 5 minutes ahead of schedule due to optimal routing. Estimated carbon savings: <strong>4.2kg CO2</strong>.
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
