import { format } from "date-fns";
import { AlertTriangle, Clock, HelpCircle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VehicleIdentityBadge } from "@/components/VehicleIdentityBadge";

const ALERT_ICONS = {
  LOW_CONFIDENCE: HelpCircle,
  STALE_INSIDE: Clock,
  UNLINKED_PARKING: AlertTriangle,
  RAPID_REENTRY: RotateCcw,
};

const SEVERITY_COLORS = {
  error: "bg-destructive text-destructive-foreground",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
};

export function AlertsPanel({ alerts, onInspect }) {
  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex items-center gap-2 p-3 border-b">
        <AlertTriangle className="h-3.5 w-3.5 text-warning" />
        <h3 className="font-display text-sm font-semibold">Alerts</h3>
        <Badge variant="secondary" className="text-[10px] ml-auto">{alerts.length}</Badge>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {alerts.slice(0, 15).map(a => {
          const Icon = ALERT_ICONS[a.type] || AlertTriangle;
          return (
            <div
              key={a.id}
              onClick={() => onInspect(a.vehicleIdentity)}
              className="flex items-start gap-2 px-3 py-2 border-b last:border-0 hover:bg-muted/30 cursor-pointer"
            >
              <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <VehicleIdentityBadge vehicleType={a.vehicleType} color={a.color} size="sm" />
                  <Badge className={`${SEVERITY_COLORS[a.severity]} text-[9px] px-1 py-0`}>
                    {a.type.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{a.message}</p>
              </div>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">{format(new Date(a.timestamp), "MMM dd HH:mm")}</span>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No alerts</div>
        )}
      </div>
    </div>
  );
}
