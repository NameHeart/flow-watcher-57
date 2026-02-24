import { motion } from "framer-motion";
import { Car, ParkingCircle, ArrowRightLeft, Users, Clock, TrendingUp } from "lucide-react";

const kpiConfig = [
  { key: "totalEntered", label: "Total Entered", icon: Car, format: (v: number) => v.toLocaleString() },
  { key: "parked", label: "Parked", icon: ParkingCircle, format: (v: number) => v.toLocaleString() },
  { key: "passedThrough", label: "Passed Through", icon: ArrowRightLeft, format: (v: number) => v.toLocaleString() },
  { key: "currentlyInside", label: "Currently Inside", icon: Users, format: (v: number) => v.toLocaleString() },
  { key: "avgParkedDuration", label: "Avg Duration", icon: Clock, format: (v: number) => `${v} min` },
  { key: "peakHour", label: "Peak Hour", icon: TrendingUp, format: (v: any) => v },
];

export function KPIStrip({ kpis }: { kpis: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpiConfig.map((cfg, i) => (
        <motion.div
          key={cfg.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-muted">
              <cfg.icon className="h-3.5 w-3.5 text-gold" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{cfg.label}</span>
          </div>
          <div className="font-display text-2xl font-bold tracking-tight">
            {cfg.format(kpis[cfg.key])}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
