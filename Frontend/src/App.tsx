import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import RoleSelect from "./pages/RoleSelect";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/donations" element={<DonationsFeed />} />
          <Route path="/matches" element={<AIMatching />} />
          <Route path="/live-map" element={<LiveMap />} />
          <Route path="/delivery/:id" element={<DeliveryTracking />} />
          <Route path="/impact" element={<ImpactAnalytics />} />
          <Route path="/organization" element={<OrganizationProfile />} />
          <Route path="/donate" element={<DonationWizard />} />
          <Route path="/review" element={<DonationReview />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/role-select" element={<RoleSelect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
