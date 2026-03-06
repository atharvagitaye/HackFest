import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LocationPicker from "@/components/shared/LocationPicker";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, ArrowRight, ArrowLeft, Lock, CheckCircle, MapPin, Loader2 } from "lucide-react";
import { donationsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["Bakery", "Prepared Meals", "Produce", "Dairy", "Protein"];

const DonationWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 fields
  const [foodCategory, setFoodCategory] = useState(categories[0]);
  const [itemName, setItemName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Step 2 fields
  const [quantityKg, setQuantityKg] = useState("");
  const [estimatedMeals, setEstimatedMeals] = useState("");

  // Location fields (GPS or manual)
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
        toast.success("Location detected!");
      },
      () => {
        setGpsLoading(false);
        toast.error("Could not get location. Please enter coordinates manually.");
      },
      { timeout: 10000 }
    );
  };

  // Step 3 fields
  const [expiryTime, setExpiryTime] = useState("");
  const [pickupDeadline, setPickupDeadline] = useState("");

  const progressPct = Math.round(((currentStep - 1) / 2) * 100);

  const steps = [
    { num: 1, title: "Photo & Name", desc: currentStep === 1 ? "Current Step" : currentStep > 1 ? "Complete" : "Incomplete" },
    { num: 2, title: "Location & Meals", desc: currentStep === 2 ? "Current Step" : currentStep > 2 ? "Complete" : "Incomplete" },
    { num: 3, title: "Expiry & Urgency", desc: currentStep === 3 ? "Current Step" : "Incomplete" },
  ];

  const createMutation = useMutation({
    mutationFn: () =>
      donationsApi.create({
        organizationId: user?.organizationId || undefined,
        foodCategory: itemName || foodCategory,
        quantityKg: quantityKg ? parseFloat(quantityKg) : undefined,
        estimatedMeals: estimatedMeals ? parseInt(estimatedMeals) : undefined,
        expiryTime: expiryTime ? new Date(expiryTime).toISOString() : undefined,
        pickupDeadline: pickupDeadline ? new Date(pickupDeadline).toISOString() : undefined,
        preparedAt: new Date().toISOString(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      }),
    onSuccess: async (donation) => {
      if (imageFile && donation?.id) {
        try {
          await donationsApi.addImage(donation.id, imageFile);
        } catch {
          // non-fatal
        }
      }
      toast.success("Donation posted successfully!");
      navigate("/donations");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to post donation");
    },
  });

  const handleNext = () => {
    if (currentStep === 1 && !foodCategory) {
      toast.error("Please select a category.");
      return;
    }
    if (currentStep < 3) setCurrentStep((s) => s + 1);
    else createMutation.mutate();
  };

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
                      step.num === currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.num < currentStep
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {step.num < currentStep ? <CheckCircle className="w-4 h-4" /> : step.num}
                    </div>
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
                  <p className="text-xs font-semibold text-primary">{progressPct}%</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
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
                  <p className="text-sm text-muted-foreground italic">{foodCategory || "Waiting for selection..."}</p>
                </div>
                <div className="bg-card rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">SUGGESTED SHELF-LIFE</p>
                  <p className="text-sm text-muted-foreground italic">{expiryTime ? new Date(expiryTime).toLocaleString() : "Waiting for input..."}</p>
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
            {currentStep === 1 && (
              <div className="card-elevated p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Step 1: Photo & Name</h2>
                <p className="text-sm text-muted-foreground mb-5">Provide a clear picture and title for your donation.</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Food Image</p>
                    <label className="border-2 border-dashed border-border rounded-xl h-52 flex flex-col items-center justify-center bg-muted/50 cursor-pointer hover:border-primary/50 transition-colors overflow-hidden relative">
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-primary mb-2" />
                          <p className="text-sm font-medium text-foreground">Drag and drop or click</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleImageFile}
                      />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Item Name</p>
                      <input
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="e.g. Artisanal Sourdough Batards"
                        className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Quantity (kg)</p>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={quantityKg}
                        onChange={(e) => setQuantityKg(e.target.value)}
                        placeholder="e.g. 12.5"
                        className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Category Quick-Select</p>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setFoodCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              cat === foodCategory ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="card-elevated p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Step 2: Location & Meals</h2>
                <p className="text-sm text-muted-foreground mb-5">Where can recipients pick up the donation?</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Estimated Meals</p>
                    <input
                      type="number"
                      min="0"
                      value={estimatedMeals}
                      onChange={(e) => setEstimatedMeals(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                {/* Pickup Location */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">Pickup Location</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGps}
                      disabled={gpsLoading}
                    >
                      {gpsLoading
                        ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Detecting...</>
                        : <><MapPin className="w-3 h-3 mr-1" />Use My GPS Location</>}
                    </Button>
                  </div>
                  
                  {/* Interactive Map Picker */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Click on the map to set pickup location</p>
                    <LocationPicker
                      latitude={latitude ? parseFloat(latitude) : null}
                      longitude={longitude ? parseFloat(longitude) : null}
                      onLocationSelect={(lat, lng) => {
                        setLatitude(lat.toFixed(6));
                        setLongitude(lng.toFixed(6));
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Latitude</p>
                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="e.g. 19.0596"
                        className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Longitude</p>
                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="e.g. 72.8294"
                        className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  {latitude && longitude && (
                    <p className="text-xs text-success mt-1">📍 Location set: {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="card-elevated p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Step 3: Expiry & Urgency</h2>
                <p className="text-sm text-muted-foreground mb-5">When does this food expire and when must it be picked up?</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Expiry Date & Time</p>
                    <input
                      type="datetime-local"
                      value={expiryTime}
                      onChange={(e) => setExpiryTime(e.target.value)}
                      className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Pickup Deadline</p>
                    <input
                      type="datetime-local"
                      value={pickupDeadline}
                      onChange={(e) => setPickupDeadline(e.target.value)}
                      className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Locked steps */}
            {currentStep < 2 && (
              <div className="card-elevated p-6 opacity-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-muted-foreground">Step 2: Location & Meals</h2>
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            )}
            {currentStep < 3 && (
              <div className="card-elevated p-6 opacity-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-muted-foreground">Step 3: Expiry & Urgency</h2>
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {currentStep > 1 ? (
                <Button variant="ghost" onClick={() => setCurrentStep((s) => s - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />Back
                </Button>
              ) : (
                <Button variant="ghost" className="text-muted-foreground">Save as Draft</Button>
              )}
              <Button size="lg" onClick={handleNext} disabled={createMutation.isPending}>
                {currentStep === 3
                  ? createMutation.isPending ? "Posting..." : "Post Donation"
                  : <>Next Step <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonationWizard;
