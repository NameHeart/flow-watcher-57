"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, logout } from "@/lib/storage";
import { BarChart3, Search, Star, LogOut, Radio, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function Layout({ children, isLive, onToggleLive }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { to: "/insights", label: "Insights", icon: Search },
    { to: "/watchlist", label: "Watchlist", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-muted md:hidden">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex items-center gap-2 p-4 border-b">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-gold">
                    <BarChart3 className="h-4 w-4 text-card" />
                  </div>
                  <span className="font-display text-lg font-bold tracking-tight">
                    Thana<span className="text-gold">City</span>
                  </span>
                </div>
                <nav className="flex flex-col p-2 gap-1">
                  {links.map((link) => (
                    <Link
                      key={link.to}
                      href={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        pathname === link.to
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="border-t p-3">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Radio
                      className={cn(
                        "h-3.5 w-3.5",
                        isLive ? "text-success animate-pulse" : "text-muted-foreground"
                      )}
                    />
                    <span className="text-xs font-medium text-muted-foreground flex-1">
                      Live Mode
                    </span>
                    <Switch
                      checked={isLive}
                      onCheckedChange={onToggleLive}
                      className="data-[state=checked]:bg-success"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-gold">
                <BarChart3 className="h-4 w-4 text-card" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight hidden sm:inline">
                Thana<span className="text-gold">City</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    pathname === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Radio
                className={cn(
                  "h-3.5 w-3.5",
                  isLive ? "text-success animate-pulse" : "text-muted-foreground"
                )}
              />
              <span className="text-xs font-medium text-muted-foreground">Live</span>
              <Switch
                checked={isLive}
                onCheckedChange={onToggleLive}
                className="data-[state=checked]:bg-success"
              />
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
      <main className="p-3 sm:p-4 lg:p-6">{children}</main>
    </div>
  );
}
