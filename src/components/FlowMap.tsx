import { useState } from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const SEGMENTS = ["All Sessions", "Parked Only", "Passed Only"] as const;

export function FlowMap({ flowDist }: { flowDist: any[] }) {
  const [segment, setSegment] = useState<typeof SEGMENTS[number]>("All Sessions");

  const getCount = (pattern: string) => {
    const row = flowDist.find((f: any) => f.pattern === pattern);
    if (!row) return 0;
    if (segment === "Parked Only") return row.parked;
    if (segment === "Passed Only") return row.passed;
    return row.total;
  };

  const total = flowDist.reduce((sum: number, f: any) => {
    if (segment === "Parked Only") return sum + f.parked;
    if (segment === "Passed Only") return sum + f.passed;
    return sum + f.total;
  }, 0);

  const pct = (pattern: string) => total > 0 ? ((getCount(pattern) / total) * 100).toFixed(1) : "0";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border bg-card p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold">Flow Map</h3>
        <div className="flex rounded-lg border bg-muted p-0.5">
          {SEGMENTS.map(s => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                segment === s ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-2 py-4">
        {/* North Gate */}
        <div className="flex items-center justify-center w-48 h-12 rounded-xl border-2 border-primary/30 bg-gold-muted">
          <span className="font-display text-sm font-semibold">NORTH GATE</span>
        </div>

        {/* Arrows N→S and S→N (vertical) */}
        <div className="flex items-center gap-16 py-1">
          <FlowArrow label={`N→S: ${getCount("N->S")}`} pct={pct("N->S")} direction="down" />
          <FlowArrow label={`S→N: ${getCount("S->N")}`} pct={pct("S->N")} direction="up" />
        </div>

        {/* Parking */}
        <div className="flex items-center gap-4">
          {/* N→N left */}
          <div className="flex flex-col items-center">
            <FlowArrowHorizontal label={`N→N: ${getCount("N->N")}`} pct={pct("N->N")} />
          </div>

          <div className="flex items-center justify-center w-52 h-16 rounded-xl gradient-gold-subtle border-2 border-primary/20">
            <div className="text-center">
              <span className="font-display text-xs font-semibold text-gold-dark block">PARKING LOT</span>
              <span className="text-xs text-muted-foreground">3 cameras</span>
            </div>
          </div>

          {/* S→S right */}
          <div className="flex flex-col items-center">
            <FlowArrowHorizontal label={`S→S: ${getCount("S->S")}`} pct={pct("S->S")} />
          </div>
        </div>

        {/* Arrows continued */}
        <div className="flex items-center gap-16 py-1">
          <FlowArrow label="" pct="" direction="down" />
          <FlowArrow label="" pct="" direction="up" />
        </div>

        {/* South Gate */}
        <div className="flex items-center justify-center w-48 h-12 rounded-xl border-2 border-primary/30 bg-gold-muted">
          <span className="font-display text-sm font-semibold">SOUTH GATE</span>
        </div>
      </div>
    </motion.div>
  );
}

function FlowArrow({ label, pct, direction }: { label: string; pct: string; direction: "up" | "down" }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center cursor-default">
          {label && (
            <span className="text-xs font-medium text-muted-foreground mb-0.5">{label}</span>
          )}
          <div className={`text-primary ${direction === "down" ? "animate-flow-down" : "animate-flow-up"}`}>
            {direction === "down" ? "↓" : "↑"}
          </div>
          {pct && <span className="text-[10px] text-muted-foreground">{pct}%</span>}
        </div>
      </TooltipTrigger>
      {label && (
        <TooltipContent>
          <p>{label} ({pct}%)</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

function FlowArrowHorizontal({ label, pct }: { label: string; pct: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center cursor-default">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span className="text-primary animate-pulse-gold">↩</span>
          <span className="text-[10px] text-muted-foreground">{pct}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label} ({pct}%)</p>
      </TooltipContent>
    </Tooltip>
  );
}
