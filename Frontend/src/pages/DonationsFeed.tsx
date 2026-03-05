import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatusBadge from "@/components/shared/StatusBadge";
import { donations } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Plus, Search, Package, MapPin } from "lucide-react";

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

const DonationsFeed = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Surplus Donations Feed</h1>
            <p className="text-muted-foreground text-sm mt-1">AI-powered food redistribution opportunities in your area</p>
          </div>
          <Button><Plus className="w-4 h-4 mr-2" />Post Donation</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                i === 0 ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Donation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {donations.map((donation) => (
            <div key={donation.id} className="card-elevated-hover overflow-hidden animate-fade-in">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={imageMap[donation.image]}
                  alt={donation.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <StatusBadge urgency={donation.urgency} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-2">{donation.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Package className="w-3 h-3" />
                  Qty: {donation.quantity}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {donation.source}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" size="lg">Load More Donations</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonationsFeed;
