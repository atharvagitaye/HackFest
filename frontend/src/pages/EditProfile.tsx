import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { ArrowLeft, Save, LocateFixed, User, Phone, MapPin, Building2 } from "lucide-react";

interface FormState {
  name: string;
  phone: string;
  address: string;
  maxCapacityKg: string;
  latitude: string;
  longitude: string;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth-me"],
    queryFn: authApi.me,
  });

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    address: "",
    maxCapacityKg: "",
    latitude: "",
    longitude: "",
  });
  const [isDirty, setIsDirty] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  // Pre-populate form once user data loads
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        address: user.organization?.address ?? "",
        maxCapacityKg: user.organization?.maxCapacityKg != null ? String(user.organization.maxCapacityKg) : "",
        latitude: user.organization?.latitude != null ? String(user.organization.latitude) : "",
        longitude: user.organization?.longitude != null ? String(user.organization.longitude) : "",
      });
      setIsDirty(false);
    }
  }, [user]);

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
        setIsDirty(true);
        setLocLoading(false);
        toast.success("Location detected");
      },
      () => { toast.error("Unable to detect location"); setLocLoading(false); }
    );
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      authApi.updateProfile({
        name: form.name || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        maxCapacityKg: form.maxCapacityKg ? parseFloat(form.maxCapacityKg) : undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      }),
    onSuccess: () => {
      // Invalidate so OrganizationProfile shows fresh data immediately
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      toast.success("Profile updated successfully");
      setIsDirty(false);
      navigate("/organization");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to save profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    saveMutation.mutate();
  };

  const handleBack = () => {
    if (isDirty && !confirm("You have unsaved changes. Discard them?")) return;
    navigate("/organization");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const hasOrg = !!user?.organizationId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-sm text-muted-foreground">Update your personal and organisation details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Details */}
          <div className="card-elevated p-6 space-y-5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Personal Details
            </h2>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Organisation Details (only shown if user has an org) */}
          {hasOrg && (
            <div className="card-elevated p-6 space-y-5">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Organisation Details
              </h2>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="123 Main Street, City"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCapacityKg">Max Capacity (kg)</Label>
                <Input
                  id="maxCapacityKg"
                  type="number"
                  min="1"
                  value={form.maxCapacityKg}
                  onChange={(e) => set("maxCapacityKg", e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Location Coordinates</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={detectLocation}
                    disabled={locLoading}
                  >
                    <LocateFixed className="w-4 h-4 mr-1.5" />
                    {locLoading ? "Detecting..." : "Auto-detect"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(e) => set("latitude", e.target.value)}
                      placeholder="e.g. 19.0760"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="longitude" className="text-xs text-muted-foreground">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(e) => set("longitude", e.target.value)}
                      placeholder="e.g. 72.8777"
                    />
                  </div>
                </div>
                {form.latitude && form.longitude && (
                  <p className="text-xs text-muted-foreground">
                    📍 {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending || !isDirty}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfile;
