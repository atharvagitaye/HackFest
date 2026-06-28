import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Settings, Leaf, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { SyncQueueIndicator } from "@/components/SyncQueueIndicator";
import { InstallAppButtonCompact, InstallAppButtonIcon } from "@/components/InstallAppButton";
import NotificationBell from "@/components/notifications/NotificationBell";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
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
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${location.pathname === item.path
                        ? "text-primary bg-secondary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
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

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${location.pathname === item.path
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
          
          {/* Sync Queue Indicator */}
          <SyncQueueIndicator />
          
          {/* Install App Button - Desktop */}
          <InstallAppButtonCompact />
          
          {/* Install App Button - Mobile */}
          <InstallAppButtonIcon />
          
          {/* Notification Bell */}
          <NotificationBell />
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
