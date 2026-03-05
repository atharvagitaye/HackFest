import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatusBadge from "@/components/shared/StatusBadge";
import { donationsApi } from "@/lib/api";
import { Donation } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Plus, Package, MapPin, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

function deriveUrgency(expiryTime?: string): "urgent" | "moderate" | "low" {
  if (!expiryTime) return "low";
  const hrs = (new Date(expiryTime).getTime() - Date.now()) / 36e5;
  if (hrs < 12) return "urgent";
  if (hrs < 24) return "moderate";
  return "low";
}

function resolveImage(foodCategory?: string): string {
  const cat = (foodCategory ?? "").toLowerCase();
  if (cat.includes("bak")) return "bakery";
  if (cat.includes("produc") || cat.includes("veg") || cat.includes("fruit")) return "produce";
  if (cat.includes("dairy") || cat.includes("milk")) return "dairy";
  if (cat.includes("deli") || cat.includes("meat")) return "deli";
  if (cat.includes("grain") || cat.includes("bread") || cat.includes("rice")) return "grains";
  return "meals";
}

const DonationsFeed = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All Items");

  const { data: donationsData, isLoading } = useQuery({
    queryKey: ["donations"],
    queryFn: () => donationsApi.list(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => donationsApi.updateStatus(id, "CANCELLED"),
    onSuccess: () => {
      toast.success("Donation cancelled.");
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to cancel"),
  });

  const donations: Donation[] = donationsData ?? [];

  const filtered = activeCategory === "All Items"
    ? donations
    : activeCategory === "Urgent"
      ? donations.filter(d => deriveUrgency(d.expiryTime) === "urgent")
      : donations.filter(d =>
          (d.foodCategory ?? "").toLowerCase().includes(activeCategory.toLowerCase())
        );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Surplus Donations Feed</h1>
            <p className="text-muted-foreground text-sm mt-1">AI-powered food redistribution opportunities in your area</p>
          </div>
          <Button onClick={() => navigate("/donate")}><Plus className="w-4 h-4 mr-2" />Post Donation</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                cat === activeCategory ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Donation Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-elevated overflow-hidden animate-pulse">
                <div className="h-44 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No donations found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {filtered.map((donation) => {
              const urgency = deriveUrgency(donation.expiryTime);
              const imgKey = resolveImage(donation.foodCategory);
              const imgUrl = imageMap[imgKey];
              return (
                <div key={donation.id} className="card-elevated-hover overflow-hidden animate-fade-in">
                  <div className="relative h-44 overflow-hidden">
                    <img src={imgUrl} alt={donation.foodCategory ?? "Food"} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <StatusBadge urgency={urgency} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 capitalize">{donation.foodCategory ?? "Food Item"}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Package className="w-3 h-3" />
                      Qty: {donation.quantityKg != null ? `${donation.quantityKg} kg` : "—"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {donation.donor?.name ?? donation.organization?.name ?? "Unknown"}
                    </div>
                    {user?.role === "DONOR" &&
                      donation.status !== "DELIVERED" &&
                      donation.status !== "CANCELLED" &&
                      donation.status !== "EXPIRED" && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive/90 h-7 px-2 text-xs"
                            onClick={(e) => { e.stopPropagation(); cancelMutation.mutate(donation.id); }}
                            disabled={cancelMutation.isPending}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <Button variant="outline" size="lg">Load More Donations</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonationsFeed;
