import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useLiveMode } from "@/hooks/useLiveMode";
import { useEvents } from "@/hooks/useEvents";
import { useSessions } from "@/hooks/useSessions";
import { useInsights } from "@/hooks/useInsights";
import { InvestigationDrawer } from "@/components/InvestigationDrawer";
import { getWatchlist, removeFromWatchlist } from "@/lib/storage";
import { computeVehicleInsights } from "@/lib/analytics";
import { Star, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { VehicleIdentityBadge } from "@/components/VehicleIdentityBadge";

const Watchlist = () => {
  const { isLive, toggleLive } = useLiveMode();
  const { events } = useEvents("30days");
  const { sessions, unlinkedParking } = useSessions(events);
  const { alerts } = useInsights(sessions, events, unlinkedParking, "daily");
  const [inspectIdentity, setInspectIdentity] = useState(null);
  const [, forceUpdate] = useState(0);

  const watchlist = getWatchlist();

  const watchlistData = useMemo(() => {
    return watchlist.map(identity => {
      const insights = computeVehicleInsights(sessions, identity);
      const identityAlerts = alerts.filter(a => a.vehicleIdentity === identity);
      return { ...insights, alertCount: identityAlerts.length };
    });
  }, [watchlist, sessions, alerts]);

  const handleRemove = (identity) => {
    removeFromWatchlist(identity);
    forceUpdate(n => n + 1);
  };

  return (
    <Layout isLive={isLive} onToggleLive={toggleLive}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary fill-primary" />
          <h1 className="font-display text-lg sm:text-xl font-bold">Watchlist</h1>
          <Badge variant="secondary" className="text-xs">{watchlist.length}</Badge>
        </div>

        {watchlistData.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 sm:p-12 text-center shadow-card">
            <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No vehicles in watchlist yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add vehicles from the Investigation Drawer or Insights page.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {watchlistData.map(d => (
              <motion.div
                key={d.vehicleIdentity}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border bg-card p-3 sm:p-4 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Star className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
                    <VehicleIdentityBadge vehicleType={d.vehicleType || "Unknown"} color={d.color || "Unknown"} size="md" />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setInspectIdentity(d.vehicleIdentity)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleRemove(d.vehicleIdentity)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
                  <span>{d.totalSessions} sessions</span>
                  <span className="text-success">{d.parked} parked</span>
                  <span className="text-info">{d.passed} passed</span>
                  <span className="text-muted-foreground">{d.parkedRatio}% rate</span>
                  {d.alertCount > 0 && <Badge variant="destructive" className="text-[10px]">{d.alertCount} alerts</Badge>}
                </div>
                {d.lastSeen && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Last seen: {format(new Date(d.lastSeen), "MMM dd, yyyy HH:mm")}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {inspectIdentity && (
        <InvestigationDrawer vehicleIdentity={inspectIdentity} sessions={sessions} alerts={alerts} onClose={() => setInspectIdentity(null)} />
      )}
    </Layout>
  );
};

export default Watchlist;
