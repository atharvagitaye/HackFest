import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DonationsFeed from "./pages/DonationsFeed";
import AIMatching from "./pages/AIMatching";
import LiveMap from "./pages/LiveMap";
import DeliveryTracking from "./pages/DeliveryTracking";
import ImpactAnalytics from "./pages/ImpactAnalytics";
import OrganizationProfile from "./pages/OrganizationProfile";
import DonationWizard from "./pages/DonationWizard";
import DonationReview from "./pages/DonationReview";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import RecipientMatches from "./pages/RecipientMatches";
import MyDonations from "./pages/MyDonations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/donations" element={<ProtectedRoute><DonationsFeed /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><AIMatching /></ProtectedRoute>} />
          <Route path="/my-matches" element={<ProtectedRoute><RecipientMatches /></ProtectedRoute>} />
          <Route path="/live-map" element={<ProtectedRoute><LiveMap /></ProtectedRoute>} />
          <Route path="/delivery" element={<ProtectedRoute><DeliveryTracking /></ProtectedRoute>} />
          <Route path="/delivery/:id" element={<ProtectedRoute><DeliveryTracking /></ProtectedRoute>} />
          <Route path="/impact" element={<ProtectedRoute><ImpactAnalytics /></ProtectedRoute>} />
          <Route path="/organization" element={<ProtectedRoute><OrganizationProfile /></ProtectedRoute>} />
          <Route path="/donate" element={<ProtectedRoute><DonationWizard /></ProtectedRoute>} />
          <Route path="/review" element={<ProtectedRoute><DonationReview /></ProtectedRoute>} />
          <Route path="/my-donations" element={<ProtectedRoute><MyDonations /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
