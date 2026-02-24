import { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PARKED: "bg-success text-success-foreground",
  PASSED_THROUGH: "bg-info text-info-foreground",
  CURRENTLY_INSIDE: "bg-warning text-warning-foreground",
  STALE_INSIDE: "bg-destructive text-destructive-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  PARKED: "Parked",
  PASSED_THROUGH: "Passed",
  CURRENTLY_INSIDE: "Inside",
  STALE_INSIDE: "Stale",
};

export function SessionsTable({ sessions, onSelectSession }: { sessions: any[]; onSelectSession: (s: any) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gateFilter, setGateFilter] = useState("all");
  const [flowFilter, setFlowFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(0);
  const perPage = 15;

  let filtered = sessions;
  if (search) filtered = filtered.filter((s: any) => s.plate.toLowerCase().includes(search.toLowerCase()));
  if (statusFilter !== "all") filtered = filtered.filter((s: any) => s.status === statusFilter);
  if (gateFilter !== "all") filtered = filtered.filter((s: any) => s.entryGate === gateFilter);
  if (flowFilter !== "all") filtered = filtered.filter((s: any) => s.flowPattern === flowFilter);

  if (sortBy === "duration") {
    filtered = [...filtered].sort((a, b) => (b.durationMinutes || 0) - (a.durationMinutes || 0));
  }

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="p-4 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search plate..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-8 h-9 text-sm" />
          </div>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[120px] h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PARKED">Parked</SelectItem>
              <SelectItem value="PASSED_THROUGH">Passed</SelectItem>
              <SelectItem value="CURRENTLY_INSIDE">Inside</SelectItem>
              <SelectItem value="STALE_INSIDE">Stale</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gateFilter} onValueChange={v => { setGateFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[120px] h-9 text-sm"><SelectValue placeholder="Gate" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gates</SelectItem>
              <SelectItem value="NORTH">North</SelectItem>
              <SelectItem value="SOUTH">South</SelectItem>
            </SelectContent>
          </Select>
          <Select value={flowFilter} onValueChange={v => { setFlowFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[120px] h-9 text-sm"><SelectValue placeholder="Flow" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Flows</SelectItem>
              <SelectItem value="N->S">N→S</SelectItem>
              <SelectItem value="S->N">S→N</SelectItem>
              <SelectItem value="N->N">N→N</SelectItem>
              <SelectItem value="S->S">S→S</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px] h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="duration">Longest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Plate</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Type</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Flow</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Duration</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Entry</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((s: any) => (
              <tr
                key={s.id}
                onClick={() => onSelectSession(s)}
                className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{s.plate}</td>
                <td className="px-4 py-2.5">
                  <Badge className={`${STATUS_COLORS[s.status]} text-[11px] font-medium`}>
                    {STATUS_LABELS[s.status] || s.status}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">{s.vehicleType}</td>
                <td className="px-4 py-2.5 hidden md:table-cell font-mono text-xs text-muted-foreground">{s.flowPattern || "—"}</td>
                <td className="px-4 py-2.5 hidden lg:table-cell text-muted-foreground">{s.durationMinutes ? `${s.durationMinutes} min` : "—"}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{format(new Date(s.entryTime), "MMM dd HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 border-t">
          <span className="text-xs text-muted-foreground">{filtered.length} sessions</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-2 py-1 rounded text-xs hover:bg-muted disabled:opacity-30">Prev</button>
            <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-2 py-1 rounded text-xs hover:bg-muted disabled:opacity-30">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
