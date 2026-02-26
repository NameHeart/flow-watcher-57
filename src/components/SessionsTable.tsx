import { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { VehicleIdentityBadge } from "@/components/VehicleIdentityBadge";

const STATUS_COLORS = {
  PARKED: "bg-success text-success-foreground",
  PASSED_THROUGH: "bg-info text-info-foreground",
  CURRENTLY_INSIDE: "bg-warning text-warning-foreground",
  STALE_INSIDE: "bg-destructive text-destructive-foreground",
};

const STATUS_LABELS = {
  PARKED: "Parked",
  PASSED_THROUGH: "Passed",
  CURRENTLY_INSIDE: "Inside",
  STALE_INSIDE: "Stale",
};

export function SessionsTable({ sessions, onSelectSession }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gateFilter, setGateFilter] = useState("all");
  const [flowFilter, setFlowFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(0);
  const perPage = 15;

  let filtered = sessions;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(s =>
      s.vehicleIdentity.toLowerCase().includes(q) ||
      s.vehicleType.toLowerCase().includes(q) ||
      s.color.toLowerCase().includes(q)
    );
  }
  if (statusFilter !== "all") filtered = filtered.filter(s => s.status === statusFilter);
  if (gateFilter !== "all") filtered = filtered.filter(s => s.entryGate === gateFilter);
  if (flowFilter !== "all") filtered = filtered.filter(s => s.flowPattern === flowFilter);
  if (typeFilter !== "all") filtered = filtered.filter(s => s.vehicleType === typeFilter);
  if (colorFilter !== "all") filtered = filtered.filter(s => s.color === colorFilter);

  if (sortBy === "duration") {
    filtered = [...filtered].sort((a, b) => (b.durationMinutes || 0) - (a.durationMinutes || 0));
  }

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  const vehicleTypes: string[] = [...new Set(sessions.map((s: any) => s.vehicleType))] as string[];
  const colors: string[] = [...new Set(sessions.map((s: any) => s.color))] as string[];

  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="p-3 sm:p-4 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search vehicle (e.g. White SUV)..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-8 h-9 text-sm" />
          </div>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[100px] sm:w-[120px] h-9 text-xs sm:text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PARKED">Parked</SelectItem>
              <SelectItem value="PASSED_THROUGH">Passed</SelectItem>
              <SelectItem value="CURRENTLY_INSIDE">Inside</SelectItem>
              <SelectItem value="STALE_INSIDE">Stale</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden sm:flex items-center gap-2">
            <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[120px] h-9 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {vehicleTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={colorFilter} onValueChange={v => { setColorFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[110px] h-9 text-sm"><SelectValue placeholder="Color" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                {colors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Vehicle</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Flow</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Duration</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Entry</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(s => (
              <tr
                key={s.id}
                onClick={() => onSelectSession(s)}
                className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2.5">
                  <VehicleIdentityBadge vehicleType={s.vehicleType} color={s.color} />
                </td>
                <td className="px-4 py-2.5">
                  <Badge className={`${STATUS_COLORS[s.status]} text-[11px] font-medium`}>
                    {STATUS_LABELS[s.status] || s.status}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 hidden md:table-cell font-mono text-xs text-muted-foreground">{s.flowPattern || "—"}</td>
                <td className="px-4 py-2.5 hidden lg:table-cell text-muted-foreground">{s.durationMinutes ? `${s.durationMinutes} min` : "—"}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{format(new Date(s.entryTime), "MMM dd HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y">
        {paginated.map(s => (
          <div
            key={s.id}
            onClick={() => onSelectSession(s)}
            className="px-3 py-3 hover:bg-muted/30 cursor-pointer transition-colors active:bg-muted/50"
          >
            <div className="flex items-center justify-between">
              <VehicleIdentityBadge vehicleType={s.vehicleType} color={s.color} />
              <Badge className={`${STATUS_COLORS[s.status]} text-[10px] font-medium`}>
                {STATUS_LABELS[s.status] || s.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="font-mono">{s.flowPattern || "—"}</span>
              {s.durationMinutes && <span>{s.durationMinutes} min</span>}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {format(new Date(s.entryTime), "MMM dd HH:mm")}
            </div>
          </div>
        ))}
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
