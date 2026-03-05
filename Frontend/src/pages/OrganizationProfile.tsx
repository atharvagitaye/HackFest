import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { organizationProfile } from "@/data/mockData";
import MapWidget from "@/components/shared/MapWidget";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Phone, MapPin, Clock, Star, Award, Trophy, Zap, Users, CheckCircle, Leaf } from "lucide-react";

const achieveIcons: Record<string, React.ElementType> = { Award, Trophy, Zap, Users };
const achieveColors = ["bg-warning/10 text-warning", "bg-info/10 text-info", "bg-success/10 text-success", "bg-primary/10 text-primary"];

const OrganizationProfile = () => {
  const org = organizationProfile;
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {/* Header */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Leaf className="w-12 h-12 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{org.name}</h1>
                <CheckCircle className="w-5 h-5 text-primary fill-primary/20" />
              </div>
              <p className="text-muted-foreground text-sm">Verified Food Redistribution Partner</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {org.location}</span>
                <span>📅 Joined {org.joinedDate}</span>
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
                <p className="text-5xl font-bold text-primary mb-2">{org.trustScore}</p>
                <div className="flex justify-center gap-0.5 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-5 h-5 ${i <= 4 ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{org.reviewCount} Verified Reviews</p>
              </div>
              <div className="space-y-2">
                {Object.entries(org.ratings).map(([stars, pct]) => (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-4 text-foreground">{stars}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full">
                      <div className="h-2 bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="card-elevated p-5">
              <h3 className="font-semibold text-foreground mb-4">Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {org.achievements.map((a, i) => {
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
                  { label: "Contact Email", value: org.email, icon: Mail },
                  { label: "Weekly Redistribution Capacity", value: org.capacity, icon: Users },
                  { label: "Phone Number", value: org.phone, icon: Phone },
                  { label: "Operating Hours", value: org.hours, icon: Clock },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-foreground mb-1.5">{label}</p>
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2.5">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground truncate">{value}</span>
                    </div>
                  </div>
                ))}
                <div>
                  <p className="text-xs font-medium text-foreground mb-1.5">Physical Address</p>
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2.5">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground">{org.address}</span>
                  </div>
                </div>
                <div>
                  <div className="bg-secondary rounded-lg p-3 border border-primary/20">
                    <p className="text-xs font-semibold text-primary uppercase mb-2">💡 STORAGE AVAILABILITY</p>
                    <div className="flex gap-2">
                      {org.storage.map(s => (
                        <span key={s} className="flex items-center gap-1 text-xs text-foreground">
                          <CheckCircle className="w-3 h-3 text-primary" /> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="card-elevated p-5">
              <h3 className="font-semibold text-foreground mb-3">Location Map</h3>
              <MapWidget markers={org.latitude && org.longitude
                ? [{ id: 1, type: "ngo", name: org.name, lat: org.latitude, lng: org.longitude, status: "active" }]
                : []} />
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "TOTAL MEALS SERVED", value: org.totalMeals },
                { label: "WASTE REDIRECTED", value: org.wasteRedirected },
                { label: "ACTIVE PARTNERS", value: org.activePartners },
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
