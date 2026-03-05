import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { impactStats, chartData, communityStories } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, TrendingUp, Utensils, CloudOff, Recycle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import communityVolunteers from "@/assets/community-volunteers.jpg";
import foodProduce from "@/assets/food-produce.jpg";
import communityKitchen from "@/assets/community-kitchen.jpg";

const iconMap: Record<string, React.ElementType> = { Utensils, CloudOff, Recycle };
const storyImages = [communityVolunteers, foodProduce, communityKitchen];

const ImpactAnalytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Impact & Sustainability Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">Real-time data on how SurplusSync is feeding communities and reducing global food waste.</p>
          </div>
          <Button variant="outline"><Calendar className="w-4 h-4 mr-2" />Last 12 Months</Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {impactStats.map((stat) => {
            const Icon = iconMap[stat.icon] || Utensils;
            return (
              <div key={stat.label} className="card-elevated p-5 animate-fade-in">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <span className="text-sm font-medium text-success flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />{stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Rescued Meals Growth</h3>
              <p className="text-sm text-muted-foreground">Monthly performance tracking rescued edible food items</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Actual Rescued</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> AI Predicted</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(162, 63%, 30%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(162, 63%, 30%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(210, 10%, 46%)" }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 15%, 89%)", borderRadius: "0.75rem", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="predicted" stroke="hsl(210, 10%, 76%)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                <Area type="monotone" dataKey="actual" stroke="hsl(162, 63%, 30%)" strokeWidth={2.5} fill="url(#colorActual)" dot={{ r: 4, fill: "hsl(162, 63%, 30%)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stories */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Community Stories</h2>
          <Button variant="link" className="text-primary p-0 h-auto">View All Impact <ArrowRight className="w-4 h-4 ml-1" /></Button>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {communityStories.map((story, i) => (
            <div key={i} className="card-elevated-hover overflow-hidden animate-fade-in">
              <div className="h-44 overflow-hidden">
                <img src={storyImages[i]} alt={story.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-3">
                  <span className="badge-info">{story.category}</span>
                  <span className="text-xs text-muted-foreground py-1">{story.readTime}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{story.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{story.excerpt}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Partner Highlight */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-foreground rounded-2xl p-8 text-background">
            <span className="badge-info mb-4 inline-block">PARTNER HIGHLIGHT</span>
            <h3 className="text-2xl font-bold mb-3">Empowering 450+ Food Banks Nationwide</h3>
            <p className="text-background/70 text-sm mb-6">Our network has grown by 30% this quarter, bringing high-quality, nutritious meals to rural food deserts.</p>
            <div className="flex gap-3">
              <Button size="sm" variant="outline" className="border-background/20 text-background hover:bg-background/10">Join the Network</Button>
              <Button size="sm" className="bg-background text-foreground hover:bg-background/90">Partner Directory</Button>
            </div>
          </div>
          <div className="bg-primary rounded-2xl p-8 text-primary-foreground flex flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-widest opacity-70 mb-2">GLOBAL EXPANSION</p>
            <p className="text-4xl font-bold">12 Active Regions</p>
            <div className="flex items-center gap-1 mt-4">
              {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-primary-foreground/20 border-2 border-primary-foreground/30" />)}
              <span className="ml-2 text-sm opacity-80">+48</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImpactAnalytics;
