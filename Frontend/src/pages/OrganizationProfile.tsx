import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MapWidget from "@/components/shared/MapWidget";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Phone, MapPin, Clock, Star, Award, Trophy, Zap, Users, CheckCircle, TrendingUp, AlertCircle, Timer, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

const achieveIcons: Record<string, React.ElementType> = { Award, Trophy, Zap, Users };
const achieveColors = ["bg-warning/10 text-warning", "bg-info/10 text-info", "bg-success/10 text-success", "bg-primary/10 text-primary"];

const STATIC_ACHIEVEMENTS = [
  { name: "Zero Waste Hero", desc: "Committed to impact", icon: "Award" },
  { name: "Verified Partner", desc: "Fully onboarded", icon: "Trophy" },
  { name: "Rapid Responder", desc: "Quick pickups", icon: "Zap" },
  { name: "Community Pillar", desc: "Active network", icon: "Users" },
];

const OrganizationProfile = () => {
  const { data: user } = useQuery({
    queryKey: ["auth-me"],
    queryFn: authApi.me,
  });

  const { data: trust } = useQuery({
    queryKey: ["auth-trust"],
    queryFn: authApi.trust,
  });

  const org = user?.organization;
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  const completionPct = trust?.completionRate != null ? Math.round(trust.completionRate * 100) : null;
  const cancellationPct = trust?.cancellationRate != null ? Math.round(trust.cancellationRate * 100) : null;
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {/* Header */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              {org?.type === "NGO" ? <Users className="w-12 h-12 text-primary" /> : <Building2 className="w-12 h-12 text-primary" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{org?.name ?? user?.name ?? "My Organization"}</h1>
                {user?.isVerified && <CheckCircle className="w-5 h-5 text-primary fill-primary/20" />}
              </div>
              <p className="text-muted-foreground text-sm">
                {org?.type ? `${org.type} · ` : ""}Verified Food Redistribution Partner
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {org?.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {org.address}</span>}
                <span>📅 Member since {joinedDate}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Share Profile</Button>
              <Button>Edit Profile</Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Trust Score */}
            <div className="card-elevated p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-primary" /> Trust & Reliability
              </h3>
              <div className="bg-muted rounded-xl p-6 text-center mb-4">
                <p className="text-5xl font-bold text-primary mb-2">{trust?.avgRating != null ? trust.avgRating.toFixed(1) : user?.trustScore?.toFixed(1) ?? "—"}</p>
                <div className="flex justify-center gap-0.5 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-5 h-5 ${
                      i <= Math.round(trust?.avgRating ?? user?.trustScore ?? 0) ? "text-warning fill-warning" : "text-muted-foreground"
                    }`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Verified Reviews</p>
              </div>

              {/* Real trust metrics */}
              <div className="space-y-3">
                {[
                  {
                    icon: TrendingUp,
                    label: "Completion Rate",
                    value: completionPct != null ? `${completionPct}%` : "—",
                    color: completionPct != null && completionPct >= 80 ? "text-success" : "text-warning",
                  },
                  {
                    icon: Timer,
                    label: "Avg Response Time",
                    value: trust?.avgResponseTimeMinutes != null ? `${trust.avgResponseTimeMinutes} min` : "—",
                    color: "text-info",
                  },
                  {
                    icon: AlertCircle,
                    label: "Cancellation Rate",
                    value: cancellationPct != null ? `${cancellationPct}%` : "—",
                    color: cancellationPct != null && cancellationPct <= 10 ? "text-success" : "text-destructive",
                  },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="w-4 h-4" /> {label}
                    </span>
                    <span className={`text-sm font-semibold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mt-4">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const rating = trust?.avgRating ?? 0;
                  const pct = stars === Math.round(rating) ? 80 : stars === Math.round(rating) - 1 ? 15 : 5;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-sm">
                      <span className="w-4 text-foreground">{stars}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="card-elevated p-5">
              <h3 className="font-semibold text-foreground mb-4">Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {STATIC_ACHIEVEMENTS.map((a, i) => {
                  const Icon = achieveIcons[a.icon] || Award;
                  return (
                    <div key={a.name} className="text-center">
                      <div className={`w-14 h-14 rounded-2xl ${achieveColors[i]} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="card-elevated p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Organization Details</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">Auto-saving...</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Contact Email", value: user?.email, icon: Mail },
                  { label: "Weekly Redistribution Capacity", value: org?.maxCapacityKg ? `Up to ${org.maxCapacityKg} kg` : "—", icon: Users },
                  { label: "Phone Number", value: user?.phone ?? "—", icon: Phone },
                  { label: "Operating Hours", value: "Mon-Sat, 08:00 - 20:00", icon: Clock },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-foreground mb-1.5">{label}</p>
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2.5">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground truncate">{value ?? "—"}</span>
                    </div>
                  </div>
                ))}
                <div>
                  <p className="text-xs font-medium text-foreground mb-1.5">Physical Address</p>
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2.5">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground">{org?.address ?? "—"}</span>
                  </div>
                </div>
                <div>
                  <div className="bg-secondary rounded-lg p-3 border border-primary/20">
                    <p className="text-xs font-semibold text-primary uppercase mb-2">💡 ORGANIZATION TYPE</p>
                    <p className="text-sm text-foreground">{org?.type ?? "Partner Organization"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="card-elevated p-5">
              <h3 className="font-semibold text-foreground mb-3">Location Map</h3>
              <MapWidget markers={org?.latitude && org?.longitude
                ? [{ id: 1, type: "ngo", name: org.name ?? "Organization", lat: org.latitude, lng: org.longitude, status: "active" }]
                : []} />
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "TRUST SCORE", value: user?.trustScore?.toFixed(1) ?? "—" },
                { label: "COMPLETION RATE", value: completionPct != null ? `${completionPct}%` : "—" },
                { label: "ORGANIZATION TYPE", value: org?.type ?? "Partner" },
              ].map(s => (
                <div key={s.label} className="card-elevated p-5 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrganizationProfile;
