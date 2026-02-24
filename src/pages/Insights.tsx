import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useEvents } from "@/hooks/useEvents";
import { useSessions } from "@/hooks/useSessions";
import { useInsights } from "@/hooks/useInsights";
import { useLiveMode } from "@/hooks/useLiveMode";
import { InvestigationDrawer } from "@/components/InvestigationDrawer";
import { computePlateInsights } from "@/lib/analytics";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, TrendingUp, Users, BarChart3 } from "lucide-react";
import { addToWatchlist } from "@/lib/storage";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const GOLD = "#D4AF37";
const DARK = "#1e2a3a";
const COLORS_CHART = ["#D4AF37", "#1e2a3a", "#E8D48B", "#94a3b8", "#22c55e", "#3b82f6", "#ef4444"];

const Insights = () => {
  const { events } = useEvents("30days");
  const { sessions, unlinkedParking } = useSessions(events);
  const { alerts, vehicleTypes, repeatVisitors, rankings } = useInsights(sessions, events, unlinkedParking, "daily");
  const { isLive, toggleLive } = useLiveMode();
  const [inspectPlate, setInspectPlate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("all");

  // Plate search
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toUpperCase();
    const plates = [...new Set(sessions.map((s: any) => s.plate))].filter((p: any) => p.includes(q));
    return plates.slice(0, 10).map((p: any) => computePlateInsights(sessions, p));
  }, [searchQuery, sessions]);

  // Vehicle type data
  const selectedTypeData = useMemo(() => {
    if (selectedVehicleType === "all") return vehicleTypes;
    return vehicleTypes.filter((v: any) => v.type === selectedVehicleType);
  }, [vehicleTypes, selectedVehicleType]);

  const vehicleTypeNames = useMemo(() => [...new Set(sessions.map((s: any) => s.vehicleType))], [sessions]);

  return (
    <Layout isLive={isLive} onToggleLive={toggleLive}>
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-xl font-bold">Insights</h1>
          <p className="text-xs text-muted-foreground">Deep analytics, search & rankings</p>
        </div>

        <Tabs defaultValue="search">
          <TabsList className="bg-muted">
            <TabsTrigger value="search" className="gap-1.5"><Search className="h-3.5 w-3.5" />Search</TabsTrigger>
            <TabsTrigger value="segments" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" />Segments</TabsTrigger>
            <TabsTrigger value="repeat" className="gap-1.5"><Users className="h-3.5 w-3.5" />Repeat</TabsTrigger>
            <TabsTrigger value="rankings" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Rankings</TabsTrigger>
          </TabsList>

          {/* SEARCH */}
          <TabsContent value="search" className="space-y-4 mt-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search plate (e.g. ABC)..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-10" />
            </div>
            {searchResults.length > 0 && (
              <div className="grid gap-3">
                {searchResults.map((r: any) => (
                  <motion.div
                    key={r.plate}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setInspectPlate(r.plate)}
                    className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover cursor-pointer transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-lg">{r.plate}</span>
                        <span className="text-xs text-muted-foreground ml-2">{r.vehicleType} · {r.color}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); addToWatchlist(r.plate); }} className="p-1.5 rounded-lg hover:bg-muted">
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>{r.totalSessions} sessions</span>
                      <span className="text-success">{r.parked} parked</span>
                      <span className="text-info">{r.passed} passed</span>
                      <span className="text-muted-foreground">{r.parkedRatio}% park rate</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Entry: {r.commonEntryGate || "—"}</span>
                      <span>Exit: {r.commonExitGate || "—"}</span>
                      <span>Flow: {r.commonFlowPattern || "—"}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No plates found matching "{searchQuery}"</p>
            )}
          </TabsContent>

          {/* SEGMENTS */}
          <TabsContent value="segments" className="space-y-4 mt-4">
            <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
              <SelectTrigger className="w-[200px] h-9 text-sm"><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {vehicleTypeNames.map((t: any) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card p-4 shadow-card">
                <h3 className="font-display text-sm font-semibold mb-3">Parked vs Passed by Type</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={selectedTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RTooltip />
                    <Bar dataKey="parked" fill={GOLD} name="Parked" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="passed" fill={DARK} name="Passed" radius={[4, 4, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-card">
                <h3 className="font-display text-sm font-semibold mb-3">Type Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={vehicleTypes} dataKey="total" nameKey="type" cx="50%" cy="50%" outerRadius={90} label={(e: any) => e.type}>
                      {vehicleTypes.map((_: any, i: number) => <Cell key={i} fill={COLORS_CHART[i % COLORS_CHART.length]} />)}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Total</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Parked</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Passed</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Avg Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleTypes.map((v: any) => (
                    <tr key={v.type} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{v.type}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{v.total}</td>
                      <td className="px-4 py-2.5 text-success">{v.parked}</td>
                      <td className="px-4 py-2.5 text-info">{v.passed}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{v.avgDuration ? `${v.avgDuration} min` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* REPEAT */}
          <TabsContent value="repeat" className="space-y-4 mt-4">
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <h3 className="font-display text-sm font-semibold mb-1">Repeat Visitors</h3>
              <p className="text-xs text-muted-foreground mb-3">Plates with 3+ sessions</p>
              {repeatVisitors.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No repeat visitors found</p>
              ) : (
                <div className="space-y-1">
                  {repeatVisitors.map((r: any) => (
                    <div
                      key={r.plate}
                      onClick={() => setInspectPlate(r.plate)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/30 cursor-pointer"
                    >
                      <span className="font-mono text-sm font-semibold">{r.plate}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{r.sessionCount} sessions</Badge>
                        <button onClick={(e) => { e.stopPropagation(); addToWatchlist(r.plate); }} className="p-1 rounded hover:bg-muted">
                          <Star className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* RANKINGS */}
          <TabsContent value="rankings" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RankingCard title="Top Parked (by frequency)" data={rankings.topParked} onInspect={setInspectPlate} />
              <RankingCard title="Top Passed Through" data={rankings.topPassed} onInspect={setInspectPlate} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {inspectPlate && (
        <InvestigationDrawer plate={inspectPlate} sessions={sessions} alerts={alerts} onClose={() => setInspectPlate(null)} />
      )}
    </Layout>
  );
};

function RankingCard({ title, data, onInspect }: { title: string; data: any[]; onInspect: (p: string) => void }) {
  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="p-3 border-b">
        <h3 className="font-display text-sm font-semibold">{title}</h3>
      </div>
      <div className="divide-y">
        {data.map((r: any, i: number) => (
          <div key={r.plate} onClick={() => onInspect(r.plate)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 cursor-pointer">
            <span className="w-5 text-xs font-bold text-muted-foreground">#{i + 1}</span>
            <span className="font-mono text-sm font-semibold flex-1">{r.plate}</span>
            <Badge variant="secondary" className="text-xs">{r.count}</Badge>
          </div>
        ))}
        {data.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">No data</p>}
      </div>
    </div>
  );
}

export default Insights;
