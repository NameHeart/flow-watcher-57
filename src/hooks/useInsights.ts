import { useMemo } from "react";
import {
  computeKPIs, computeTrendData, computeFlowDistribution,
  computeGateLoad, detectAnomalies, computeVehicleTypeSegmentation,
  computeRepeatVisitors, computeRankings
} from "@/lib/analytics";

export function useInsights(sessions: any[], events: any[], unlinkedParking: any[], granularity: "hourly" | "daily") {
  const kpis = useMemo(() => computeKPIs(sessions, events), [sessions, events]);
  const trends = useMemo(() => computeTrendData(sessions, granularity), [sessions, granularity]);
  const flowDist = useMemo(() => computeFlowDistribution(sessions), [sessions]);
  const gateLoad = useMemo(() => computeGateLoad(sessions), [sessions]);
  const alerts = useMemo(() => detectAnomalies(sessions, events, unlinkedParking), [sessions, events, unlinkedParking]);
  const vehicleTypes = useMemo(() => computeVehicleTypeSegmentation(sessions), [sessions]);
  const repeatVisitors = useMemo(() => computeRepeatVisitors(sessions), [sessions]);
  const rankings = useMemo(() => computeRankings(sessions), [sessions]);

  return { kpis, trends, flowDist, gateLoad, alerts, vehicleTypes, repeatVisitors, rankings };
}
