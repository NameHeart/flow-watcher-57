import { useMemo } from "react";
import {
  computeKPIs, computeGateTrends, computeParkingTrends,
  computeGateLoad, computeParkingLoad, computeFlowDistribution,
  detectAnomalies, computeVehicleTypeSegmentation,
  computeRepeatVisitors, computeRankings, computeGatePeakHours
} from "@/lib/analytics";

export function useInsights(sessions, events, unlinkedParking, granularity) {
  const kpis = useMemo(() => computeKPIs(sessions, events), [sessions, events]);
  const gateTrends = useMemo(() => computeGateTrends(events, granularity), [events, granularity]);
  const parkingTrends = useMemo(() => computeParkingTrends(events, granularity), [events, granularity]);
  const gateLoad = useMemo(() => computeGateLoad(events), [events]);
  const parkingLoad = useMemo(() => computeParkingLoad(events), [events]);
  const flowDist = useMemo(() => computeFlowDistribution(sessions), [sessions]);
  const alerts = useMemo(() => detectAnomalies(sessions, events, unlinkedParking), [sessions, events, unlinkedParking]);
  const vehicleTypes = useMemo(() => computeVehicleTypeSegmentation(sessions), [sessions]);
  const repeatVisitors = useMemo(() => computeRepeatVisitors(sessions), [sessions]);
  const rankings = useMemo(() => computeRankings(sessions), [sessions]);
  const gatePeakHours = useMemo(() => computeGatePeakHours(events), [events]);

  return { kpis, gateTrends, parkingTrends, gateLoad, parkingLoad, flowDist, alerts, vehicleTypes, repeatVisitors, rankings, gatePeakHours };
}
