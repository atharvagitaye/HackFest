import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { impactApi } from "@/lib/api";
import { LeaderboardEntry } from "@/types/api";
import { Trophy, Medal, Award, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const PERIODS = [
  { value: "all", label: "All Time" },
  { value: "monthly", label: "This Month" },
  { value: "weekly", label: "This Week" },
] as const;

const Leaderboard = () => {
  const [period, setPeriod] = useState<"all" | "monthly" | "weekly">("all");
  const [tab, setTab] = useState<"donors" | "recipients">("donors");

  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", tab, period],
    queryFn: () => impactApi.leaderboard({ type: tab, period, limit: 20 }),
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
  };

  const getMetricLabel = () => {
    return tab === "donors" ? "Kg Saved" : "Kg Received";
  };

  const getMetricValue = (entry: LeaderboardEntry) => {
    return tab === "donors" 
      ? entry.totalKgSaved?.toFixed(1) ?? "0"
      : entry.totalKgReceived?.toFixed(1) ?? "0";
  };

  const getSecondaryMetric = (entry: LeaderboardEntry) => {
    return tab === "donors"
      ? `${entry.totalMealsSaved ?? 0} meals · ${entry.totalDonations ?? 0} donations`
      : `${entry.totalMealsServed ?? 0} meals · ${entry.totalDeliveries ?? 0} deliveries`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Celebrating our top contributors in the fight against food waste
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Tab Switcher */}
          <div className="bg-muted rounded-xl p-1.5 flex gap-1">
            {["donors", "recipients"].map((type) => (
              <button
                key={type}
                onClick={() => setTab(type as "donors" | "recipients")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  tab === type
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Top {type}
              </button>
            ))}
          </div>

          {/* Period Filter */}
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No data available for this period</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;

              return (
                <div
                  key={entry.userId}
                  className={`card-elevated p-5 flex items-center gap-4 ${
                    isTopThree ? "border-2 border-primary/20 bg-primary/5" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="w-12 flex justify-center">{getRankIcon(rank)}</div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-lg truncate">
                      {entry.name}
                    </h3>
                    {entry.organizationName && (
                      <p className="text-sm text-muted-foreground truncate">
                        {entry.organizationName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {getSecondaryMetric(entry)}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="text-sm font-medium text-foreground">
                        {entry.trustScore.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{getMetricValue(entry)}</p>
                      <p className="text-xs text-muted-foreground uppercase">{getMetricLabel()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Rankings are updated in real-time based on platform activity.
            <br />
            Keep contributing to climb the leaderboard!
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
