import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Search, Settings, Leaf, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { matchesApi } from "@/lib/api";
import { Match } from "@/types/api";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Notification count: unactioned matches for RECIPIENT
  const { data: myMatches = [] } = useQuery<Match[]>({
    queryKey: ["my-matches"],
    queryFn: matchesApi.getMyMatches,
    enabled: user?.role === "RECIPIENT",
    refetchInterval: 30_000,
  });
  const notifCount = user?.role === "RECIPIENT"
    ? myMatches.filter((m) => m.donation?.status === "MATCHED" && !m.selected).length
    : 0;

  const navItems = [
    { label: "Dashboard", path: user?.role === "ADMIN" ? "/admin" : "/dashboard" },
    { label: "Donations", path: "/donations" },
    ...(user?.role === "DONOR"
      ? [{ label: "My Donations", path: "/my-donations" }]
      : []),
    ...(user?.role !== "DONOR"
      ? [{ label: "Matches", path: user?.role === "RECIPIENT" ? "/my-matches" : "/matches" }]
      : []),
    { label: "Deliveries", path: "/delivery" },
    { label: "Live Map", path: "/live-map" },
    { label: "Impact", path: "/impact" },
    { label: "Leaderboard", path: "/leaderboard" },
  ];

  const initials = user
    ? user.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">SurplusSync</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "text-primary bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-muted rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              placeholder="Search..."
              className="bg-transparent text-sm outline-none w-40 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
            onClick={() => user?.role === "RECIPIENT" ? navigate("/my-matches") : undefined}
          >
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </Button>
          {/* Profile link */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => navigate("/organization")}
            title="Profile"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {user.role}
                  </span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate("/login")}>Log in</Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
