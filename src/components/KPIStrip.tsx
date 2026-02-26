import { motion } from "framer-motion";

export function KPIStrip({ kpis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Primary KPI: Total Vehicles (Gate IN) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-6 sm:p-8 shadow-card text-center"
      >
        <h3 className="font-display text-xs sm:text-sm font-semibold tracking-widest uppercase text-muted-foreground">
          Total Vehicles
        </h3>
        <div className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-2">
          {kpis.totalEntered.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Gate Entries</p>
      </motion.div>

      {/* Primary KPI: Total Parking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border bg-card p-6 sm:p-8 shadow-card text-center"
      >
        <h3 className="font-display text-xs sm:text-sm font-semibold tracking-widest uppercase text-muted-foreground">
          Total Parking Vehicles
        </h3>
        <div className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-2">
          {kpis.totalParking.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Cars Parked</p>
      </motion.div>
    </div>
  );
}
