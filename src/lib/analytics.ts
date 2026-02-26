// Analytics functions — pure, backend-ready

import { format, startOfDay, startOfHour, differenceInMinutes } from "date-fns";

export function computeKPIs(sessions: any[], events: any[]) {
  const totalEntered = sessions.length;
  const parked = sessions.filter(s => s.status === "PARKED").length;
  const passedThrough = sessions.filter(s => s.status === "PASSED_THROUGH").length;
  const currentlyInside = sessions.filter(s => s.status === "CURRENTLY_INSIDE" || s.status === "STALE_INSIDE").length;

  const parkedDurations = sessions
    .filter(s => s.status === "PARKED" && s.durationMinutes)
    .map(s => s.durationMinutes);
  const avgParkedDuration = parkedDurations.length > 0
    ? Math.round(parkedDurations.reduce((a: any, b: any) => a + b, 0) / parkedDurations.length)
    : 0;

  const hourCounts: any = {};
  sessions.forEach(s => {
    const h = new Date(s.entryTime).getHours();
    const key = `${h}:00`;
    hourCounts[key] = (hourCounts[key] || 0) + 1;
  });
  const peakHour = Object.entries(hourCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A";

  return { totalEntered, parked, passedThrough, currentlyInside, avgParkedDuration, peakHour };
}

export function computeTrendData(sessions: any[], granularity: any) {
  const grouped: any = {};

  sessions.forEach(s => {
    const d = new Date(s.entryTime);
    const key = granularity === "hourly"
      ? format(startOfHour(d), "yyyy-MM-dd HH:mm")
      : format(startOfDay(d), "yyyy-MM-dd");

    if (!grouped[key]) grouped[key] = { entered: 0, parked: 0, passed: 0, northIn: 0, southIn: 0 };
    grouped[key].entered++;
    if (s.status === "PARKED") grouped[key].parked++;
    if (s.status === "PASSED_THROUGH") grouped[key].passed++;
    if (s.entryGate === "NORTH") grouped[key].northIn++;
    if (s.entryGate === "SOUTH") grouped[key].southIn++;
  });

  return Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, val]: any) => ({
      time: key,
      label: granularity === "hourly" ? key.split(" ")[1] : format(new Date(key), "MMM dd"),
      ...val,
    }));
}

export function computeFlowDistribution(sessions: any[]) {
  const flows: any = {
    "N->N": { total: 0, parked: 0, passed: 0 },
    "N->S": { total: 0, parked: 0, passed: 0 },
    "S->N": { total: 0, parked: 0, passed: 0 },
    "S->S": { total: 0, parked: 0, passed: 0 },
  };

  sessions.filter(s => s.flowPattern).forEach(s => {
    const fp = s.flowPattern;
    if (flows[fp]) {
      flows[fp].total++;
      if (s.status === "PARKED") flows[fp].parked++;
      if (s.status === "PASSED_THROUGH") flows[fp].passed++;
    }
  });

  return Object.entries(flows).map(([pattern, counts]: any) => ({ pattern, ...counts }));
}

export function computeGateLoad(sessions: any[]) {
  const gates: any = { NORTH: { inCount: 0, outCount: 0 }, SOUTH: { inCount: 0, outCount: 0 } };
  sessions.forEach(s => {
    if (s.entryGate === "NORTH") gates.NORTH.inCount++;
    if (s.entryGate === "SOUTH") gates.SOUTH.inCount++;
    if (s.exitGate === "NORTH") gates.NORTH.outCount++;
    if (s.exitGate === "SOUTH") gates.SOUTH.outCount++;
  });
  return [
    { gate: "North Gate", inCount: gates.NORTH.inCount, outCount: gates.NORTH.outCount },
    { gate: "South Gate", inCount: gates.SOUTH.inCount, outCount: gates.SOUTH.outCount },
  ];
}

export function detectAnomalies(sessions: any[], events: any[], unlinkedParking: any[], confidenceThreshold = 0.75) {
  const alerts: any[] = [];
  let alertId = 0;

  events.filter(e => (e.confidence || 1) < confidenceThreshold).forEach(e => {
    alertId++;
    alerts.push({
      id: `alert-${alertId}`,
      type: "LOW_CONFIDENCE",
      severity: "warning",
      plate: e.plate,
      message: `Low confidence detection (${((e.confidence || 0) * 100).toFixed(0)}%) at ${e.location}`,
      timestamp: e.timestamp,
      eventId: e.id,
    });
  });

  sessions.filter(s => s.status === "STALE_INSIDE").forEach(s => {
    alertId++;
    alerts.push({
      id: `alert-${alertId}`,
      type: "STALE_INSIDE",
      severity: "error",
      plate: s.plate,
      message: `Vehicle exceeded max session duration (${24}h)`,
      timestamp: s.entryTime,
      sessionId: s.id,
    });
  });

  unlinkedParking.forEach(e => {
    alertId++;
    alerts.push({
      id: `alert-${alertId}`,
      type: "UNLINKED_PARKING",
      severity: "warning",
      plate: e.plate,
      message: `Parking detection without active session at ${e.location}`,
      timestamp: e.timestamp,
      eventId: e.id,
    });
  });

  const completedByPlate: any = {};
  sessions.filter(s => s.exitTime).forEach(s => {
    if (!completedByPlate[s.plate]) completedByPlate[s.plate] = [];
    completedByPlate[s.plate].push(s);
  });

  Object.values(completedByPlate).forEach((plateSessions: any) => {
    plateSessions.sort((a: any, b: any) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime());
    for (let i = 0; i < plateSessions.length - 1; i++) {
      const exitTime = new Date(plateSessions[i].exitTime).getTime();
      const nextEntry = new Date(plateSessions[i + 1].entryTime).getTime();
      if (nextEntry - exitTime < 10 * 60000) {
        alertId++;
        alerts.push({
          id: `alert-${alertId}`,
          type: "RAPID_REENTRY",
          severity: "info",
          plate: plateSessions[i].plate,
          message: `Re-entered within ${Math.round((nextEntry - exitTime) / 60000)} minutes`,
          timestamp: plateSessions[i + 1].entryTime,
          sessionId: plateSessions[i + 1].id,
        });
      }
    }
  });

  alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return alerts;
}

export function computePlateInsights(sessions: any[], plate: any) {
  const plateSessions = sessions.filter(s => s.plate === plate);
  const parked = plateSessions.filter(s => s.status === "PARKED").length;
  const passed = plateSessions.filter(s => s.status === "PASSED_THROUGH").length;
  const total = plateSessions.length;
  const ratio = total > 0 ? ((parked / total) * 100).toFixed(0) : "0";

  const lastSession = plateSessions[0];
  const commonEntry = mode(plateSessions.map(s => s.entryGate).filter(Boolean));
  const commonExit = mode(plateSessions.map(s => s.exitGate).filter(Boolean));
  const commonFlow = mode(plateSessions.map(s => s.flowPattern).filter(Boolean));

  return {
    plate,
    totalSessions: total,
    parked,
    passed,
    parkedRatio: ratio,
    lastSeen: lastSession?.entryTime || null,
    lastLocation: lastSession?.entryGate || null,
    commonEntryGate: commonEntry,
    commonExitGate: commonExit,
    commonFlowPattern: commonFlow,
    vehicleType: lastSession?.vehicleType,
    color: lastSession?.color,
    sessions: plateSessions,
  };
}

function mode(arr: any[]) {
  if (arr.length === 0) return null;
  const counts: any = {};
  arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0][0];
}

export function computeVehicleTypeSegmentation(sessions: any[]) {
  const byType: any = {};

  sessions.forEach(s => {
    const t = s.vehicleType || "Unknown";
    if (!byType[t]) byType[t] = { parked: 0, passed: 0, total: 0, durations: [] };
    byType[t].total++;
    if (s.status === "PARKED") {
      byType[t].parked++;
      if (s.durationMinutes) byType[t].durations.push(s.durationMinutes);
    }
    if (s.status === "PASSED_THROUGH") byType[t].passed++;
  });

  return Object.entries(byType).map(([type, data]: any) => ({
    type,
    ...data,
    avgDuration: data.durations.length > 0
      ? Math.round(data.durations.reduce((a: any, b: any) => a + b, 0) / data.durations.length)
      : 0,
  }));
}

export function computeRepeatVisitors(sessions: any[], minSessions = 3) {
  const byPlate: any = {};
  sessions.forEach(s => {
    byPlate[s.plate] = (byPlate[s.plate] || 0) + 1;
  });

  return Object.entries(byPlate)
    .filter(([_, count]: any) => count >= minSessions)
    .sort((a: any, b: any) => b[1] - a[1])
    .map(([plate, count]: any) => ({ plate, sessionCount: count }));
}

export function computeRankings(sessions: any[]) {
  const parkedFreq: any = {};
  const passedFreq: any = {};

  sessions.forEach(s => {
    if (s.status === "PARKED") parkedFreq[s.plate] = (parkedFreq[s.plate] || 0) + 1;
    if (s.status === "PASSED_THROUGH") passedFreq[s.plate] = (passedFreq[s.plate] || 0) + 1;
  });

  const topParked = Object.entries(parkedFreq).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10)
    .map(([plate, count]: any) => ({ plate, count }));
  const topPassed = Object.entries(passedFreq).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10)
    .map(([plate, count]: any) => ({ plate, count }));

  return { topParked, topPassed };
}
