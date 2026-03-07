import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MapWidget from '@/components/shared/MapWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { donationsApi } from '@/lib/offlineApi';
import { ArrowLeft, Package, MapPin, Calendar, Clock, Building2, User, Scale, Utensils, AlertCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  REPORTED: "bg-blue-100 text-blue-700",
  MATCHED: "bg-violet-100 text-violet-700",
  ACCEPTED: "bg-cyan-100 text-cyan-700",
  PICKED_UP: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
};

export default function DonationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: donation, isLoading } = useQuery({
    queryKey: ['donation', id],
    queryFn: () => donationsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-elevated h-24 animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Donation not found</p>
            <Button className="mt-4" onClick={() => navigate('/donations')}>
              Back to Donations
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const markers = [];
  if (donation.latitude && donation.longitude) {
    markers.push({
      id: 1,
      type: 'donation',
      name: donation.organization?.name || 'Pickup Location',
      lat: donation.latitude,
      lng: donation.longitude,
      status: donation.status,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span className="cursor-pointer hover:underline" onClick={() => navigate('/donations')}>
            Donations
          </span>
          <span>›</span>
          <span className="text-primary">Donation Details</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{donation.foodCategory || 'Food Donation'}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[donation.status] || 'bg-gray-100 text-gray-700'}`}>
                {donation.status}
              </span>
              <span className="text-sm text-muted-foreground">ID: #{donation.id.slice(0, 8)}</span>
            </div>
          </div>
          <Button variant="outline" className="self-start" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Image */}
            {donation.images?.[0] && (
              <div className="card-elevated overflow-hidden">
                <img
                  src={donation.images[0].imageUrl}
                  alt="Donation"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Details */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold text-foreground mb-4">Donation Details</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Food Category</p>
                    <p className="text-sm font-medium text-foreground">{donation.foodCategory || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Scale className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="text-sm font-medium text-foreground">{donation.quantityKg ? `${donation.quantityKg} kg` : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Utensils className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Meals</p>
                    <p className="text-sm font-medium text-foreground">{donation.estimatedMeals || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created At</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(donation.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {donation.expiryTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Expiry Time</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(donation.expiryTime).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {donation.pickupDeadline && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup Deadline</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(donation.pickupDeadline).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            {markers.length > 0 && (
              <div className="card-elevated p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Pickup Location
                </h3>
                <MapWidget markers={markers} />
                {donation.organization?.address && (
                  <p className="text-sm text-muted-foreground mt-3">
                    📍 {donation.organization.address}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization */}
            {donation.organization && (
              <div className="card-elevated p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Organization
                </h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="font-medium text-foreground mb-1">{donation.organization.name}</p>
                  <Badge variant="outline" className="text-xs mb-2">
                    {donation.organization.type}
                  </Badge>
                  {donation.organization.address && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {donation.organization.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Donor Info */}
            {donation.donor && (
              <div className="card-elevated p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Donor Information
                </h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="font-medium text-foreground mb-2">{donation.donor.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Trust Score:</span>
                    <Badge variant="default" className="text-xs">
                      {(donation.donor.trustScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Status Info */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold text-foreground mb-4">Current Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[donation.status] || 'bg-gray-100 text-gray-700'}`}>
                    {donation.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Donation ID</span>
                  <span className="text-xs font-mono text-foreground">{donation.id.slice(0, 12)}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
