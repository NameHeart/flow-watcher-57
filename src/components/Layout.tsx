import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "@/lib/storage";
import { BarChart3, Search, Star, LogOut, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export function Layout({
  children,
  isLive,
  onToggleLive,
}: {
  children: ReactNode;
  isLive: boolean;
  onToggleLive: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { to: "/insights", label: "Insights", icon: Search },
    { to: "/watchlist", label: "Watchlist", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-gold">
                <BarChart3 className="h-4 w-4 text-card" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                Thana<span className="text-gold">City</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    location.pathname === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Radio className={cn("h-3.5 w-3.5", isLive ? "text-success animate-pulse" : "text-muted-foreground")} />
              <span className="text-xs font-medium text-muted-foreground">Live</span>
              <Switch checked={isLive} onCheckedChange={onToggleLive} className="data-[state=checked]:bg-success" />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="p-4 lg:p-6">{children}</main>
    </div>
  );
}
