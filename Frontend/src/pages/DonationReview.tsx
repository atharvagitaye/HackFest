import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MapWidget from "@/components/shared/MapWidget";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Clock, MapPin, Repeat } from "lucide-react";
import foodPastries from "@/assets/food-pastries.jpg";

const DonationReview = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>Dashboard</span><span>›</span><span>Donation Wizard</span><span>›</span><span className="text-primary">Review & Confirm</span>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Review Your Donation</h1>
        <p className="text-muted-foreground text-sm mb-8">Verify the details of your surplus contribution and let our AI handle the logistics.</p>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Donation Summary */}
            <div className="card-elevated p-0 overflow-hidden">
              <div className="grid md:grid-cols-[280px_1fr]">
                <div className="relative h-64 md:h-auto">
                  <img src={foodPastries} alt="Surplus Pastries" className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 badge-urgent">URGENT PICKUP</span>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">Surplus Pastries & Sandwiches</h3>
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  </div>
                  <p className="text-sm text-foreground mb-4">Quantity: <strong>15kg assorted items</strong></p>
                  <div className="bg-secondary rounded-xl p-4 border border-primary/20 mb-4">
                    <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-2">
                      <Sparkles className="w-3 h-3" /> AI PREDICTED IMPACT
                    </p>
                    <p className="text-sm text-foreground">
                      This donation is estimated to provide <span className="text-primary font-semibold">15 full meals</span> for local shelters.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Best before: Today, 8:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Recurring */}
            <div className="card-elevated p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Repeat className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Recurring Donation</p>
                <p className="text-xs text-muted-foreground">Automate this pickup every Wednesday at 5:00 PM.</p>
              </div>
              <div className="w-10 h-5 bg-muted rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-muted-foreground/30 rounded-full absolute top-0.5 left-0.5" />
              </div>
            </div>

            {/* Location */}
            <div className="card-elevated p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Pickup Location
                </h3>
                <Button variant="link" className="text-primary p-0 h-auto text-sm">Edit Location</Button>
              </div>
              <MapWidget markers={[{ id: 1, type: "donation", name: "Artisan Baker's Loft", lat: 50, lng: 50, status: "pending" }]} />
              <div className="mt-3">
                <p className="text-sm font-semibold text-foreground">Artisan Baker's Loft</p>
                <p className="text-xs text-muted-foreground">452 Market St, San Francisco, CA 94104</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="card-elevated p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Final Step</h3>
              <div className="space-y-3 mb-5">
                {[
                  { title: "Identity Verified", desc: "Business account is active" },
                  { title: "Quality Standards", desc: "Food safety protocol confirmed" },
                  { title: "AI Matching", desc: "3 charities notified in area" },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full" size="lg">
                Confirm & AI Match <Sparkles className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="w-full mt-2">Save Draft</Button>
              <p className="text-[10px] text-muted-foreground text-center mt-3 leading-relaxed">
                By clicking confirm, you agree to our Good Samaritan food safety guidelines and SurplusSync's terms of service.
              </p>
            </div>

            <div className="bg-secondary rounded-xl p-4 border border-primary/20">
              <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-2">💡 PRO TIP</p>
              <p className="text-sm text-foreground leading-relaxed">
                Donations picked up within 2 hours have a 40% higher satisfaction rating.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonationReview;
