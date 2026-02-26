import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { KPIStrip } from "@/components/KPIStrip";
import { FlowMap } from "@/components/FlowMap";
import {
  GateInOutTrendChart, ParkingTrendChart,
  GateLoadChart, VehicleTypeChart, VehicleTypeDonutChart
} from "@/components/DashboardCharts";
import { SessionsTable } from "@/components/SessionsTable";
import { LiveEventStream } from "@/components/LiveEventStream";
import { AlertsPanel } from "@/components/AlertsPanel";
import { InvestigationDrawer } from "@/components/InvestigationDrawer";
import { TimeRangeSelector } from "@/components/TimeRangeSelector";
import { useEvents } from "@/hooks/useEvents";
import { useSessions } from "@/hooks/useSessions";
import { useInsights } from "@/hooks/useInsights";
import { useLiveMode } from "@/hooks/useLiveMode";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Radio, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("30days");
  const { events } = useEvents(timeRange);
  const { sessions, unlinkedParking } = useSessions(events);
  const granularity = timeRange === "today" ? "hourly" : "daily";
  const { kpis, gateTrends, parkingTrends, gateLoad, flowDist, alerts, vehicleTypeByDirection } = useInsights(sessions, events, unlinkedParking, granularity);
  const { isLive, liveEvents, toggleLive } = useLiveMode();
  const [inspectIdentity, setInspectIdentity] = useState(null);
  const [liveOpen, setLiveOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const handleSelectSession = useCallback((s) => {
    setInspectIdentity(s.vehicleIdentity);
  }, []);

  const handleInspect = useCallback((identity) => {
    setInspectIdentity(identity);
  }, []);

  return (
    <Layout isLive={isLive} onToggleLive={toggleLive}>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Real-time vehicle flow & parking analytics</p>
          </div>
          <TimeRangeSelector value={timeRange} onChange={(v) => setTimeRange(v)} />
        </div>

        <KPIStrip kpis={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Gate trends */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GateInOutTrendChart data={gateTrends} />
              <ParkingTrendChart data={parkingTrends} />
            </div>
            {/* Gate load + Vehicle Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GateLoadChart data={gateLoad} />
              <VehicleTypeDonutChart data={vehicleTypeByDirection} />
            </div>
            {/* Vehicle Type IN vs OUT */}
            <VehicleTypeChart data={vehicleTypeByDirection} />
            <FlowMap flowDist={flowDist} />
            <SessionsTable sessions={sessions} onSelectSession={handleSelectSession} />
          </div>

          <div className="space-y-4">
            <div className="hidden lg:block space-y-4">
              {isLive && <LiveEventStream events={liveEvents} onInspect={handleInspect} />}
              <AlertsPanel alerts={alerts} onInspect={handleInspect} />
            </div>

            <div className="lg:hidden space-y-3">
              {isLive && (
                <Collapsible open={liveOpen} onOpenChange={setLiveOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full rounded-xl border bg-card p-3 shadow-card">
                    <div className="flex items-center gap-2">
                      <Radio className="h-3.5 w-3.5 text-success animate-pulse" />
                      <span className="font-display text-sm font-semibold">Live Events</span>
                      <span className="text-xs text-muted-foreground">{liveEvents.length}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${liveOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2">
                      <LiveEventStream events={liveEvents} onInspect={handleInspect} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
              <Collapsible open={alertsOpen} onOpenChange={setAlertsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full rounded-xl border bg-card p-3 shadow-card">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    <span className="font-display text-sm font-semibold">Alerts</span>
                    <span className="text-xs text-muted-foreground">{alerts.length}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${alertsOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2">
                    <AlertsPanel alerts={alerts} onInspect={handleInspect} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>

      {inspectIdentity && (
        <InvestigationDrawer
          vehicleIdentity={inspectIdentity}
          sessions={sessions}
          alerts={alerts}
          onClose={() => setInspectIdentity(null)}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
