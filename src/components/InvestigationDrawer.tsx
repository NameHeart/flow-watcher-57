import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, StarOff, Clock, ArrowRightLeft, ParkingCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { computePlateInsights } from "@/lib/analytics";
import { addToWatchlist, removeFromWatchlist, isOnWatchlist } from "@/lib/storage";
import { useState, useMemo } from "react";

const STATUS_LABELS: Record<string, string> = {
  PARKED: "Parked",
  PASSED_THROUGH: "Passed",
  CURRENTLY_INSIDE: "Inside",
  STALE_INSIDE: "Stale",
};

export function InvestigationDrawer({
  plate,
  sessions,
  alerts,
  onClose,
}: {
  plate: string | null;
  sessions: any[];
  alerts: any[];
  onClose: () => void;
}) {
  const [watchlistState, setWatchlistState] = useState(plate ? isOnWatchlist(plate) : false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const insights = useMemo(() => {
    if (!plate) return null;
    return computePlateInsights(sessions, plate);
  }, [plate, sessions]);

  const plateAlerts = useMemo(() => {
    if (!plate) return [];
    return alerts.filter((a: any) => a.plate === plate);
  }, [plate, alerts]);

  if (!plate || !insights) return null;

  const toggleWatchlist = () => {
    if (watchlistState) {
      removeFromWatchlist(plate);
    } else {
      addToWatchlist(plate);
    }
    setWatchlistState(!watchlistState);
  };

  const selectedSession = selectedSessionId
    ? insights.sessions.find((s: any) => s.id === selectedSessionId)
    : insights.sessions[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l shadow-xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold font-mono">{plate}</h2>
              <p className="text-xs text-muted-foreground">{insights.vehicleType} · {insights.color}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleWatchlist} className="p-2 rounded-lg hover:bg-muted transition-colors">
                {watchlistState ? <Star className="h-4 w-4 text-primary fill-primary" /> : <StarOff className="h-4 w-4 text-muted-foreground" />}
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2">
            <MiniKPI label="Sessions" value={insights.totalSessions} />
            <MiniKPI label="Parked" value={insights.parked} />
            <MiniKPI label="Passed" value={insights.passed} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MiniKPI label="Park Rate" value={`${insights.parkedRatio}%`} />
            <MiniKPI label="Entry" value={insights.commonEntryGate || "—"} />
            <MiniKPI label="Flow" value={insights.commonFlowPattern || "—"} />
          </div>

          {insights.lastSeen && (
            <p className="text-xs text-muted-foreground">
              Last seen: {format(new Date(insights.lastSeen), "MMM dd, yyyy HH:mm")} at {insights.lastLocation}
            </p>
          )}

          {/* Alerts */}
          {plateAlerts.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Alerts ({plateAlerts.length})
              </h3>
              <div className="space-y-1">
                {plateAlerts.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="rounded-lg bg-muted/50 px-3 py-1.5 text-xs">
                    <span className="font-medium">{a.type.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground ml-1">— {a.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessions */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">Recent Sessions</h3>
            <div className="space-y-1">
              {insights.sessions.slice(0, 10).map((s: any) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSessionId(s.id)}
                  className={`rounded-lg px-3 py-2 text-xs cursor-pointer transition-colors ${
                    selectedSession?.id === s.id ? "bg-gold-muted border border-primary/20" : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{STATUS_LABELS[s.status] || s.status}</span>
                    <span className="text-muted-foreground">{format(new Date(s.entryTime), "MMM dd HH:mm")}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                    <span>{s.flowPattern || "—"}</span>
                    {s.durationMinutes && <span>· {s.durationMinutes} min</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Timeline */}
          {selectedSession && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Event Timeline</h3>
              <div className="border-l-2 border-primary/20 ml-2 space-y-2">
                {selectedSession.events.map((e: any, i: number) => (
                  <div key={e.id} className="relative pl-4">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                    <div className="text-xs">
                      <span className="font-medium">{e.direction}</span>
                      <span className="text-muted-foreground"> at {e.location.replace(/_/g, " ")}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(e.timestamp), "HH:mm:ss")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function MiniKPI({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-display text-sm font-bold mt-0.5">{value}</div>
    </div>
  );
}
