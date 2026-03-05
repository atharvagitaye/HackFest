import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, ArrowRight, Lock } from "lucide-react";

const categories = ["Bakery", "Prepared Meals", "Produce", "Dairy", "Protein"];

const steps = [
  { num: 1, title: "Photo & Name", desc: "Current Step" },
  { num: 2, title: "Details & Quantity", desc: "Incomplete" },
  { num: 3, title: "Expiry & Urgency", desc: "Incomplete" },
];

const DonationWizard = () => {
  const [currentStep] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card-elevated p-5">
              <h3 className="font-semibold text-foreground mb-4">Donation Wizard</h3>
              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.num} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                      step.num === currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>{step.num}</div>
                    <div>
                      <p className={`text-sm font-medium ${step.num === currentStep ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</p>
                      <p className={`text-xs ${step.num === currentStep ? "text-primary" : "text-muted-foreground"}`}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-foreground">Overall Progress</p>
                  <p className="text-xs font-semibold text-primary">33%</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "33%" }} />
                </div>
              </div>
            </div>

            <div className="card-elevated p-5 border-primary/20 bg-secondary/50">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" /> SMART SUGGEST AI
              </h3>
              <p className="text-xs text-muted-foreground mb-4">AI will predict category and shelf-life once you upload a photo.</p>
              <div className="space-y-3">
                <div className="bg-card rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">PREDICTED CATEGORY</p>
                  <p className="text-sm text-muted-foreground italic">Waiting for image...</p>
                </div>
                <div className="bg-card rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">SUGGESTED SHELF-LIFE</p>
                  <p className="text-sm text-muted-foreground italic">Waiting for image...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Quick Donation Wizard</h1>
              <p className="text-muted-foreground text-sm mt-1">Effortlessly list your surplus food. Our AI helps fill in the blanks so you can save time and reduce waste.</p>
            </div>

            {/* Step 1 */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Step 1: Photo & Name</h2>
              <p className="text-sm text-muted-foreground mb-5">Provide a clear picture and title for your donation.</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Food Image</p>
                  <div className="border-2 border-dashed border-border rounded-xl h-52 flex flex-col items-center justify-center bg-muted/50 cursor-pointer hover:border-primary/50 transition-colors">
                    <Camera className="w-8 h-8 text-primary mb-2" />
                    <p className="text-sm font-medium text-foreground">Drag and drop or click</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Item Name</p>
                    <input
                      placeholder="e.g. Artisanal Sourdough Batards"
                      className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Category Quick-Select</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat, i) => (
                        <button key={cat} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          i === 0 ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"
                        }`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 (locked) */}
            <div className="card-elevated p-6 opacity-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-muted-foreground">Step 2: Details & Quantity</h2>
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Step 3 (locked) */}
            <div className="card-elevated p-6 opacity-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-muted-foreground">Step 3: Expiry & Urgency</h2>
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" className="text-muted-foreground">Save as Draft</Button>
              <Button size="lg">Next Step <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonationWizard;
