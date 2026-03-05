import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { matches } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Shield, Clock, TrendingUp, RefreshCw, Star } from "lucide-react";
import communityKitchen from "@/assets/community-kitchen.jpg";

const AIMatching = () => {
  const topMatch = matches[0];
  const otherMatches = matches.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3" /> POWERED BY SURPLUSAI
            </p>
            <h1 className="text-3xl font-bold text-foreground">AI Smart Matching</h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-lg">
              Optimization algorithms connecting your surplus directly to those in need based on real-time urgency, capacity, and proximity.
            </p>
          </div>
          <Button><RefreshCw className="w-4 h-4 mr-2" />Recalculate Matches</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-6 mb-8 border-b border-border">
          {["Best Matches", "Near You", "High Urgency"].map((tab, i) => (
            <button key={tab} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              i === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>{tab}</button>
          ))}
        </div>

        {/* Top Match */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" /> Recommended Pick
          </h2>
          <div className="card-elevated p-0 overflow-hidden">
            <div className="grid md:grid-cols-[300px_1fr] gap-0">
              <div className="relative h-64 md:h-auto">
                <img src={communityKitchen} alt={topMatch.ngo} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 badge-info">TOP MATCH</span>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{topMatch.ngo}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {topMatch.distance} away • {topMatch.area}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center bg-card">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">{topMatch.matchScore}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase">MATCH</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "CAPACITY", value: topMatch.capacity, icon: "📦" },
                    { label: "TRUST SCORE", value: `${topMatch.trustScore}/5.0`, icon: "🛡️" },
                    { label: "EST. PICKUP", value: topMatch.pickupTime, icon: "🕐" },
                    { label: "IMPACT RANK", value: topMatch.rank, icon: "📈" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-muted rounded-xl p-3">
                      <p className="text-[10px] font-semibold text-primary uppercase">{label}</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{icon} {value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button>Accept Match</Button>
                  <Button variant="outline">View Details</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Matches */}
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
                  {match.ngo.charAt(0)}
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{match.matchScore}%</span>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{match.ngo}</h3>
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {match.distance} • {match.area}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {["PRODUCE", "DAIRY"].map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground uppercase">{tag}</span>
                ))}
              </div>
              <Button variant="outline" className="w-full">Select Match</Button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIMatching;
