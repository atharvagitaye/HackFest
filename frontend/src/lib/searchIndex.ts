import {
  LayoutDashboard,
  Package,
  Truck,
  Map,
  BarChart2,
  Trophy,
  User,
  Settings,
  Bell,
  GitMerge,
  ClipboardList,
  HelpCircle,
  WifiOff,
  Download,
  QrCode,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SearchAction = "open-notifications";

export interface SearchEntry {
  id: string;
  label: string;
  description: string;
  path?: string;
  action?: SearchAction;
  keywords: string[];
  icon: LucideIcon;
  /** If set, only users with one of these roles see this entry. */
  roles?: ("DONOR" | "RECIPIENT" | "ADMIN")[];
}

/**
 * Central navigation index. To add a new page, append one entry here.
 */
const ALL_ENTRIES: SearchEntry[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Your main overview",
    path: "/dashboard",
    icon: LayoutDashboard,
    keywords: ["dashboard", "home", "overview", "summary", "main", "start"],
    roles: ["DONOR", "RECIPIENT"],
  },
  {
    id: "admin-dashboard",
    label: "Admin Dashboard",
    description: "Admin control panel",
    path: "/admin",
    icon: LayoutDashboard,
    keywords: ["admin", "dashboard", "panel", "control", "manage"],
    roles: ["ADMIN"],
  },
  {
    id: "donations",
    label: "Donations",
    description: "Browse all food donations",
    path: "/donations",
    icon: Package,
    keywords: ["donations", "donate", "food", "feed", "surplus", "items", "browse"],
  },
  {
    id: "post-donation",
    label: "Post a Donation",
    description: "Create a new food donation",
    path: "/donate",
    icon: Package,
    keywords: ["post", "create", "new donation", "add", "give", "contribute"],
    roles: ["DONOR"],
  },
  {
    id: "my-donations",
    label: "My Donations",
    description: "Your donation history",
    path: "/my-donations",
    icon: ClipboardList,
    keywords: ["my donations", "history", "posted", "given", "my items", "past"],
    roles: ["DONOR"],
  },
  {
    id: "matches",
    label: "AI Matching",
    description: "AI-powered donation matching",
    path: "/matches",
    icon: GitMerge,
    keywords: ["matches", "matching", "ai", "algorithm", "assign", "auto"],
    roles: ["DONOR", "ADMIN"],
  },
  {
    id: "my-matches",
    label: "My Matches",
    description: "Matched donations for your organisation",
    path: "/my-matches",
    icon: GitMerge,
    keywords: ["my matches", "matches", "accept", "reject", "recipient", "pending", "assigned"],
    roles: ["RECIPIENT"],
  },
  {
    id: "deliveries",
    label: "Delivery Tracking",
    description: "Track active pickups and deliveries",
    path: "/delivery",
    icon: Truck,
    keywords: [
      "deliveries", "delivery", "tracking", "track", "orders", "order",
      "history", "pickup", "pick up", "transit", "in transit", "courier",
    ],
  },
  {
    id: "qr-verification",
    label: "QR Verification",
    description: "Scan a QR code to confirm pickup",
    path: "/delivery",
    icon: QrCode,
    keywords: ["qr", "qr code", "scan", "verify", "verification", "barcode", "confirm pickup"],
    roles: ["RECIPIENT"],
  },
  {
    id: "live-map",
    label: "Live Map",
    description: "See donations and deliveries on a map",
    path: "/live-map",
    icon: Map,
    keywords: ["live map", "map", "location", "geo", "geographic", "nearby", "area"],
  },
  {
    id: "impact",
    label: "Impact Dashboard",
    description: "Analytics, stats, and impact metrics",
    path: "/impact",
    icon: BarChart2,
    keywords: [
      "impact", "analytics", "stats", "statistics", "metrics", "charts",
      "reports", "data", "performance", "insights", "analysis",
    ],
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    description: "Top donors and recipients",
    path: "/leaderboard",
    icon: Trophy,
    keywords: ["leaderboard", "ranking", "rankings", "top", "leaders", "scores", "best", "community"],
  },
  {
    id: "community-stories",
    label: "Community Stories",
    description: "Impact stories from the community",
    path: "/leaderboard",
    icon: Users,
    keywords: ["community", "stories", "community stories", "people", "testimonials"],
  },
  {
    id: "profile",
    label: "Organisation Profile",
    description: "Your organisation details and trust score",
    path: "/organization",
    icon: User,
    keywords: ["profile", "organisation", "organization", "my profile", "account", "details", "bio", "about"],
  },
  {
    id: "edit-profile",
    label: "Edit Profile",
    description: "Update your personal and organisation info",
    path: "/organization/edit",
    icon: Settings,
    keywords: [
      "edit profile", "settings", "update profile", "change name",
      "edit", "update", "preferences", "account settings",
    ],
  },
  {
    id: "offline-downloads",
    label: "Offline Downloads",
    description: "Manage offline data and downloads",
    path: "/dashboard",
    icon: Download,
    keywords: ["offline", "downloads", "cache", "sync", "pwa", "install", "offline mode"],
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "View your recent alerts and updates",
    action: "open-notifications",
    icon: Bell,
    keywords: ["notifications", "alerts", "bell", "messages", "updates", "inbox", "unread"],
  },
  {
    id: "help",
    label: "Help",
    description: "Get help and support",
    path: "/dashboard",
    icon: HelpCircle,
    keywords: ["help", "support", "guide", "faq", "assistance", "docs", "documentation"],
  },
  {
    id: "offline-status",
    label: "Offline Mode",
    description: "View sync queue and offline status",
    path: "/dashboard",
    icon: WifiOff,
    keywords: ["offline", "sync", "queue", "network", "connection"],
  },
];

export function getSearchIndex(role?: string): SearchEntry[] {
  return ALL_ENTRIES.filter(
    (e) => !e.roles || (role && e.roles.includes(role as "DONOR" | "RECIPIENT" | "ADMIN"))
  );
}

export function querySearchIndex(query: string, role?: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const index = getSearchIndex(role);
  return index.filter(
    (e) =>
      e.label.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.keywords.some((k) => k.includes(q))
  );
}
