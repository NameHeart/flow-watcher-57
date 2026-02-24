import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { KPIStrip } from "@/components/KPIStrip";
import { FlowMap } from "@/components/FlowMap";
import { EnteredTrendChart, ParkedVsPassedChart, FlowDistributionChart, GateLoadChart } from "@/components/DashboardCharts";
import { SessionsTable } from "@/components/SessionsTable";
import { LiveEventStream } from "@/components/LiveEventStream";
import { AlertsPanel } from "@/components/AlertsPanel";
import { InvestigationDrawer } from "@/components/InvestigationDrawer";
import { TimeRangeSelector } from "@/components/TimeRangeSelector";
import { useEvents } from "@/hooks/useEvents";
import { useSessions } from "@/hooks/useSessions";
import { useInsights } from "@/hooks/useInsights";
import { useLiveMode } from "@/hooks/useLiveMode";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<"today" | "7days" | "30days">("30days");
  const { events } = useEvents(timeRange);
  const { sessions, unlinkedParking } = useSessions(events);
  const granularity = timeRange === "today" ? "hourly" as const : "daily" as const;
  const { kpis, trends, flowDist, gateLoad, alerts } = useInsights(sessions, events, unlinkedParking, granularity);
  const { isLive, liveEvents, toggleLive } = useLiveMode();
  const [inspectPlate, setInspectPlate] = useState<string | null>(null);

  const handleSelectSession = useCallback((s: any) => {
    setInspectPlate(s.plate);
  }, []);

  const handleInspect = useCallback((plate: string) => {
    setInspectPlate(plate);
  }, []);

  return (
    <Layout isLive={isLive} onToggleLive={toggleLive}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-display text-xl font-bold">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Real-time vehicle flow & parking analytics</p>
          </div>
          <TimeRangeSelector value={timeRange} onChange={(v: any) => setTimeRange(v)} />
        </div>

        <KPIStrip kpis={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnteredTrendChart data={trends} />
              <ParkedVsPassedChart data={trends} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FlowDistributionChart data={flowDist} />
              <GateLoadChart data={gateLoad} />
            </div>
            <FlowMap flowDist={flowDist} />
            <SessionsTable sessions={sessions} onSelectSession={handleSelectSession} />
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {isLive && <LiveEventStream events={liveEvents} onInspect={handleInspect} />}
            <AlertsPanel alerts={alerts} onInspect={handleInspect} />
          </div>
        </div>
      </div>

      {inspectPlate && (
        <InvestigationDrawer
          plate={inspectPlate}
          sessions={sessions}
          alerts={alerts}
          onClose={() => setInspectPlate(null)}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
