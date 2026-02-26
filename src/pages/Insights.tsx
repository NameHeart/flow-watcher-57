import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useEvents } from "@/hooks/useEvents";
import { useSessions } from "@/hooks/useSessions";
import { useInsights } from "@/hooks/useInsights";
import { useLiveMode } from "@/hooks/useLiveMode";
import { InvestigationDrawer } from "@/components/InvestigationDrawer";
import { computeVehicleInsights } from "@/lib/analytics";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, TrendingUp, Users, BarChart3 } from "lucide-react";
import { addToWatchlist } from "@/lib/storage";
import { motion } from "framer-motion";
import { VehicleIdentityBadge } from "@/components/VehicleIdentityBadge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

const GOLD = "hsl(43, 73%, 52%)";
const DARK = "hsl(220, 20%, 12%)";
const INFO = "hsl(210, 80%, 52%)";
const COLORS_CHART = ["hsl(43,73%,52%)", "hsl(220,20%,12%)", "hsl(43,60%,70%)", "hsl(220,10%,46%)", "hsl(152,60%,42%)", "hsl(210,80%,52%)", "hsl(0,72%,51%)"];

const Insights = () => {
  const { events } = useEvents("30days");
  const { sessions, unlinkedParking } = useSessions(events);
  const { alerts, vehicleTypes, repeatVisitors, rankings, gateTrends, parkingTrends, gateLoad, gatePeakHours } = useInsights(sessions, events, unlinkedParking, "daily");
  const { isLive, toggleLive } = useLiveMode();
  const [inspectIdentity, setInspectIdentity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("all");

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const identities = [...new Set(sessions.map(s => s.vehicleIdentity))].filter(id => id.toLowerCase().includes(q));
    return identities.slice(0, 10).map(id => computeVehicleInsights(sessions, id));
  }, [searchQuery, sessions]);

  const selectedTypeData = useMemo(() => {
    if (selectedVehicleType === "all") return vehicleTypes;
    return vehicleTypes.filter(v => v.type === selectedVehicleType);
  }, [vehicleTypes, selectedVehicleType]);

  const vehicleTypeNames = useMemo(() => [...new Set(sessions.map(s => s.vehicleType))], [sessions]);

  return (
    <Layout isLive={isLive} onToggleLive={toggleLive}>
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-lg sm:text-xl font-bold">Insights</h1>
          <p className="text-xs text-muted-foreground">Gate usage, parking analytics, search & rankings</p>
        </div>

        <Tabs defaultValue="gates">
          <TabsList className="bg-muted w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="gates" className="gap-1 sm:gap-1.5 text-xs sm:text-sm"><BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /><span className="hidden xs:inline">Gates</span></TabsTrigger>
            <TabsTrigger value="search" className="gap-1 sm:gap-1.5 text-xs sm:text-sm"><Search className="h-3 w-3 sm:h-3.5 sm:w-3.5" /><span className="hidden xs:inline">Search</span></TabsTrigger>
            <TabsTrigger value="segments" className="gap-1 sm:gap-1.5 text-xs sm:text-sm"><TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" /><span className="hidden xs:inline">Segments</span></TabsTrigger>
            <TabsTrigger value="rankings" className="gap-1 sm:gap-1.5 text-xs sm:text-sm"><Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" /><span className="hidden xs:inline">Rankings</span></TabsTrigger>
          </TabsList>

          {/* Gates tab - IN/OUT trends per gate, peak hours, parking */}
          <TabsContent value="gates" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gate A/B/C IN vs OUT trends */}
              <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-card min-w-0">
                <h3 className="font-display text-xs sm:text-sm font-semibold mb-3">Gate A/B/C IN Trends</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={gateTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,90%)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} width={30} />
                    <RTooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="gateA_in" stroke={GOLD} fill={GOLD} fillOpacity={0.4} name="Gate A IN" />
                    <Area type="monotone" dataKey="gateB_in" stroke={DARK} fill={DARK} fillOpacity={0.2} name="Gate B IN" />
                    <Area type="monotone" dataKey="gateC_in" stroke={INFO} fill={INFO} fillOpacity={0.2} name="Gate C IN" />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-card min-w-0">
                <h3 className="font-display text-xs sm:text-sm font-semibold mb-3">Parking Usage Trend</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={parkingTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,90%)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} width={30} />
                    <RTooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="total" stroke={GOLD} fill={GOLD} fillOpacity={0.5} name="Parking" />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gate load comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-card min-w-0">
                <h3 className="font-display text-xs sm:text-sm font-semibold mb-3">Gate Load (IN vs OUT)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={gateLoad}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,90%)" />
                    <XAxis dataKey="gate" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} width={30} />
                    <RTooltip />
                    <Bar dataKey="inCount" fill={GOLD} name="IN" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outCount" fill={DARK} name="OUT" radius={[4, 4, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-card">
                <h3 className="font-display text-xs sm:text-sm font-semibold mb-3">Peak Hours by Gate</h3>
                <div className="space-y-3">
                  {Object.entries(gatePeakHours || {}).map(([gate, data]: any) => (
                    <div key={gate} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                      <span className="text-sm font-medium">{gate.replace("GATE_", "Gate ")}</span>
                      <div className="text-right">
                        <div className="font-display text-lg font-bold text-primary">{data.hour}</div>
                        <div className="text-[10px] text-muted-foreground">{data.count} entries</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4 mt-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search vehicle (e.g. White SUV)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10" />
            </div>
            {searchResults.length > 0 && (
              <div className="grid gap-3">
                {searchResults.map(r => (
                  <motion.div
                    key={r.vehicleIdentity}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setInspectIdentity(r.vehicleIdentity)}
                    className="rounded-xl border bg-card p-3 sm:p-4 shadow-card hover:shadow-card-hover cursor-pointer transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <VehicleIdentityBadge vehicleType={r.vehicleType} color={r.color} size="md" />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); addToWatchlist(r.vehicleIdentity); }} className="p-1.5 rounded-lg hover:bg-muted flex-shrink-0">
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
                      <span>{r.totalSessions} sessions</span>
                      <span className="text-success">{r.parked} parked</span>
                      <span className="text-info">{r.passed} passed</span>
                      <span className="text-muted-foreground">{r.parkedRatio}% rate</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Entry: {r.commonEntryGate?.replace("GATE_", "Gate ") || "—"}</span>
                      <span>Exit: {r.commonExitGate?.replace("GATE_", "Gate ") || "—"}</span>
                      <span>Flow: {r.commonFlowPattern || "—"}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No vehicles found matching &quot;{searchQuery}&quot;</p>
            )}
          </TabsContent>

          <TabsContent value="segments" className="space-y-4 mt-4">
            <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
              <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm"><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {vehicleTypeNames.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-card min-w-0">
                <h3 className="font-display text-xs sm:text-sm font-semibold mb-3">Parked vs Passed by Type</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={selectedTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,90%)" />
                    <XAxis dataKey="type" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} width={30} />
                    <RTooltip />
                    <Bar dataKey="parked" fill={GOLD} name="Parked" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="passed" fill={DARK} name="Passed" radius={[4, 4, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-card min-w-0">
                <h3 className="font-display text-xs sm:text-sm font-semibold mb-3">Type Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={vehicleTypes} dataKey="total" nameKey="type" cx="50%" cy="50%" outerRadius={75} label={(e) => e.type} labelLine={false}>
                      {vehicleTypes.map((_, i) => <Cell key={i} fill={COLORS_CHART[i % COLORS_CHART.length]} />)}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-muted-foreground text-xs sm:text-sm">Type</th>
                    <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-muted-foreground text-xs sm:text-sm">Total</th>
                    <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-muted-foreground text-xs sm:text-sm">Parked</th>
                    <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-muted-foreground text-xs sm:text-sm">Passed</th>
                    <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-muted-foreground text-xs sm:text-sm">Avg Dur.</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleTypes.map(v => (
                    <tr key={v.type} className="border-b hover:bg-muted/30">
                      <td className="px-3 sm:px-4 py-2.5 font-medium text-xs sm:text-sm">{v.type}</td>
                      <td className="px-3 sm:px-4 py-2.5 text-muted-foreground text-xs sm:text-sm">{v.total}</td>
                      <td className="px-3 sm:px-4 py-2.5 text-success text-xs sm:text-sm">{v.parked}</td>
                      <td className="px-3 sm:px-4 py-2.5 text-info text-xs sm:text-sm">{v.passed}</td>
                      <td className="px-3 sm:px-4 py-2.5 text-muted-foreground text-xs sm:text-sm">{v.avgDuration ? `${v.avgDuration} min` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="rankings" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RankingCard title="Top Parked (by Vehicle Type)" data={rankings.topParkedTypes} onInspect={setInspectIdentity} />
              <RankingCard title="Top Passed Through (by Type)" data={rankings.topPassedTypes} onInspect={setInspectIdentity} />
              <RankingCard title="Top Colors (Parked)" data={rankings.topColors} onInspect={setInspectIdentity} />
              <RankingCard title="Most Common Vehicles" data={rankings.topIdentities} onInspect={setInspectIdentity} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {inspectIdentity && (
        <InvestigationDrawer vehicleIdentity={inspectIdentity} sessions={sessions} alerts={alerts} onClose={() => setInspectIdentity(null)} />
      )}
    </Layout>
  );
};

function RankingCard({ title, data, onInspect }) {
  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="p-3 border-b">
        <h3 className="font-display text-xs sm:text-sm font-semibold">{title}</h3>
      </div>
      <div className="divide-y">
        {data.map((r, i) => (
          <div key={r.label} onClick={() => onInspect(r.label)} className="flex items-center gap-3 px-3 sm:px-4 py-2.5 hover:bg-muted/30 cursor-pointer">
            <span className="w-5 text-xs font-bold text-muted-foreground">#{i + 1}</span>
            <span className="text-xs sm:text-sm font-semibold flex-1 truncate min-w-0">{r.label}</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">{r.count}</Badge>
          </div>
        ))}
        {data.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">No data</p>}
      </div>
    </div>
  );
}

export default Insights;
