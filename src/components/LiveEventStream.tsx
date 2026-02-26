import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Eye } from "lucide-react";

export function LiveEventStream({ events, onInspect }) {
  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex items-center gap-2 p-3 border-b">
        <Radio className="h-3.5 w-3.5 text-success animate-pulse" />
        <h3 className="font-display text-sm font-semibold">Live Events</h3>
        <span className="text-xs text-muted-foreground ml-auto">{events.length} events</span>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {events.slice(0, 20).map(e => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between px-3 py-2 border-b last:border-0 hover:bg-muted/30"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  e.direction === "IN" ? "bg-success" : e.direction === "OUT" ? "bg-destructive" : "bg-warning"
                }`} />
                <span className="font-mono text-xs font-semibold truncate">{e.plate}</span>
                <span className="text-[10px] text-muted-foreground">{e.direction}</span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">{e.location.replace("_", " ")}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-muted-foreground">{format(new Date(e.timestamp), "HH:mm:ss")}</span>
                <button onClick={() => onInspect(e.plate)} className="p-1 rounded hover:bg-muted">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {events.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">Waiting for events...</div>
        )}
      </div>
    </div>
  );
}
