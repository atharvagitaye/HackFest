import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, CheckCircle, Utensils, Truck, Users, Package, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Footer from "@/components/layout/Footer";
import { InstallAppButton } from "@/components/InstallAppButton";
import heroImage from "@/assets/hero-food-donation.jpg";
import communityVolunteers from "@/assets/community-volunteers.jpg";
import communityKitchen from "@/assets/community-kitchen.jpg";
import foodProduce from "@/assets/food-produce.jpg";

const Landing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">SurplusSync</span>
                </div>
                <nav className="flex flex-col gap-4">
                  {["How It Works", "Impact", "Solutions", "About Us"].map((item) => (
                    <a
                      key={item}
                      href="#"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                  <div className="flex flex-col gap-3 mt-4 border-t border-border pt-6">
                    <Button variant="outline" asChild className="w-full justify-center">
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                    </Button>
                    <Button asChild className="w-full justify-center">
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Join the Movement</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground hidden sm:inline-block">SurplusSync</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {["How It Works", "Impact", "Solutions", "About Us"].map((item) => (
              <a key={item} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log In</Link>
            <Button asChild>
              <Link to="/dashboard">Join the Movement</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container grid lg:grid-cols-2 gap-0 items-stretch min-h-[520px]">
          <div className="flex flex-col justify-center py-12 lg:py-20 lg:pr-8">
            <span className="badge-info mb-4 w-fit">FIGHTING GLOBAL HUNGER</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-foreground">
              Turn Surplus Food<br />Into <span className="text-gradient">Shared Hope</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Our AI-powered platform connects surplus food from businesses to those who need it most, reducing waste and fighting hunger in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/dashboard">Become a Donor</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link to="/donations">Find Food Near You</Link>
              </Button>
            </div>
            
            {/* Install App Button - Only visible when installable */}
            <div className="mb-8">
              <InstallAppButton 
                variant="secondary" 
                size="lg" 
                showIcon={true}
                className="w-full sm:w-auto"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-card" />
                ))}
              </div>
              Joined by 2,400+ businesses nationwide
            </div>
          </div>
          <div className="hidden lg:block relative rounded-2xl overflow-hidden my-8">
            <img src={heroImage} alt="Chef preparing surplus food for donation" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card">
        <div className="container">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest text-center mb-3">OUR PROCESS</p>
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">Simplified Food Redistribution</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Our intelligent matching system ensures food reaches its destination quickly and safely through a coordinated network of partners.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Package, title: "Donor Upload", desc: "Restaurants and grocers list surplus food in seconds via our mobile app or web dashboard." },
              { icon: Utensils, title: "AI Matching", desc: "Our algorithm identifies the best local charities based on proximity, food type, and current need." },
              { icon: Truck, title: "Easy Pickup", desc: "Coordinated logistics partners or volunteer couriers are dispatched for seamless collection." },
              { icon: Users, title: "Fast Delivery", desc: "Fresh food is delivered to community centers, shelters, and families within the hour." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-elevated p-6 text-center animate-fade-in">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Our Growing Impact</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Together, we are transforming the way we handle surplus. Every pound of food redirected is a step toward a zero-waste, hunger-free world.
            </p>
            <ul className="space-y-3">
              {["Reducing methane emissions from landfills", "Supporting local food bank infrastructure", "Providing tax benefits for surplus donors"].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "1.2M+", label: "MEALS SERVED", color: "bg-primary" },
              { value: "450T", label: "CO2 PREVENTED", color: "bg-warning" },
              { value: "850+", label: "RETAIL PARTNERS", color: "bg-secondary" },
              { value: "12K+", label: "VOLUNTEERS", color: "bg-secondary" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.color === "bg-primary" || stat.color === "bg-warning" ? stat.color + " text-primary-foreground" : "card-elevated"} rounded-2xl p-6 text-center`}>
                <p className={`text-3xl font-extrabold mb-1 ${stat.color === "bg-primary" || stat.color === "bg-warning" ? "" : "text-primary"}`}>{stat.value}</p>
                <p className={`text-xs font-semibold uppercase tracking-wider ${stat.color === "bg-primary" || stat.color === "bg-warning" ? "opacity-80" : "text-muted-foreground"}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stories */}
      <section className="py-20 bg-card">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Community Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { img: communityVolunteers, cat: "COMMUNITY", title: "How local kitchens are scaling fresh nutrition" },
              { img: foodProduce, cat: "ENVIRONMENT", title: "Zero-waste grocery initiative saves 12 tons" },
              { img: communityKitchen, cat: "INNOVATION", title: "The logistics of hope: AI in redistribution" },
            ].map((story) => (
              <div key={story.title} className="card-elevated-hover overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img src={story.img} alt={story.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex gap-2 mb-3">
                    <span className="badge-info">{story.cat}</span>
                    <span className="text-xs text-muted-foreground py-1">5 MIN READ</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{story.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">Exploring how communities are transforming surplus into sustenance...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="bg-foreground rounded-3xl p-6 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-background mb-4">Ready to feed your community?</h2>
            <p className="text-background/70 mb-8 max-w-md mx-auto">
              Join our network of sustainable businesses and community organizations today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/dashboard">Get Started for Free</Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-background/10 border-background/30 text-background hover:bg-background/20 hover:border-background/40 w-full sm:w-auto" asChild>
                <Link to="/impact">Talk to an Expert</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
