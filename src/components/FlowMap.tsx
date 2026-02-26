import { useState } from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const SEGMENTS = ["All Sessions", "Parked Only", "Passed Only"];

export function FlowMap({ flowDist }) {
  const [segment, setSegment] = useState("All Sessions");

  const getCount = (pattern) => {
    const row = flowDist.find(f => f.pattern === pattern);
    if (!row) return 0;
    if (segment === "Parked Only") return row.parked;
    if (segment === "Passed Only") return row.passed;
    return row.total;
  };

  const total = flowDist.reduce((sum, f) => {
    if (segment === "Parked Only") return sum + f.parked;
    if (segment === "Passed Only") return sum + f.passed;
    return sum + f.total;
  }, 0);

  const pct = (pattern) => total > 0 ? ((getCount(pattern) / total) * 100).toFixed(1) : "0";

  // All possible flow patterns for 3 gates
  const gates = ["A", "B", "C"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border bg-card p-3 sm:p-5 shadow-card"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h3 className="font-display text-sm font-semibold">Flow Map</h3>
        <div className="flex rounded-lg border bg-muted p-0.5 w-full sm:w-auto">
          {SEGMENTS.map(s => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={`flex-1 sm:flex-none px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                segment === s ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-3 py-4">
        {/* Gates row */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
          {gates.map(g => (
            <div key={g} className="flex items-center justify-center w-24 sm:w-32 h-10 sm:h-12 rounded-xl border-2 border-primary/30 bg-gold-muted">
              <span className="font-display text-xs sm:text-sm font-semibold">GATE {g}</span>
            </div>
          ))}
        </div>

        {/* Flow arrows section */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-md mx-auto">
          {gates.map(from => (
            <div key={from} className="flex flex-col items-center gap-1">
              {gates.map(to => {
                const pattern = `${from}→${to}`;
                const count = getCount(pattern);
                if (count === 0 && from !== to) return null;
                return (
                  <Tooltip key={pattern}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-default text-center">
                        <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground">
                          {pattern}: {count}
                        </span>
                        <span className="text-[9px] text-muted-foreground">({pct(pattern)}%)</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{pattern}: {count} ({pct(pattern)}%)</p></TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>

        {/* Parking lot */}
        <div className="flex items-center justify-center w-44 sm:w-56 h-12 sm:h-16 rounded-xl gradient-gold-subtle border-2 border-primary/20">
          <div className="text-center">
            <span className="font-display text-[10px] sm:text-xs font-semibold text-gold-dark block">PARKING LOT</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">2 cameras</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
