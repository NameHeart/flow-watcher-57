// Analytics functions — pure, backend-ready (vehicle identity based)

import { format, startOfDay, startOfHour } from "date-fns";
import { getVehicleIdentity } from "./sessionize";

export function computeKPIs(sessions: any[], events: any[]) {
  const totalEntered = sessions.length;
  const parked = sessions.filter(s => s.status === "PARKED").length;
  const passedThrough = sessions.filter(s => s.status === "PASSED_THROUGH").length;
  const currentlyInside = sessions.filter(s => s.status === "CURRENTLY_INSIDE" || s.status === "STALE_INSIDE").length;

  const parkedDurations = sessions
    .filter(s => s.status === "PARKED" && s.durationMinutes)
    .map(s => s.durationMinutes);
  const avgParkedDuration = parkedDurations.length > 0
    ? Math.round(parkedDurations.reduce((a, b) => a + b, 0) / parkedDurations.length)
    : 0;

  const hourCounts = {};
  sessions.forEach(s => {
    const h = new Date(s.entryTime).getHours();
    const key = `${h}:00`;
    hourCounts[key] = (hourCounts[key] || 0) + 1;
  });
  const peakHour = Object.entries(hourCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A";

  return { totalEntered, parked, passedThrough, currentlyInside, avgParkedDuration, peakHour };
}

export function computeTrendData(sessions: any[], granularity: any) {
  const grouped = {};

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
  const flows = {
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
  const gates = { NORTH: { inCount: 0, outCount: 0 }, SOUTH: { inCount: 0, outCount: 0 } };
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
      vehicleIdentity: getVehicleIdentity(e.vehicleType, e.color),
      vehicleType: e.vehicleType,
      color: e.color,
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
      vehicleIdentity: s.vehicleIdentity,
      vehicleType: s.vehicleType,
      color: s.color,
      message: `Vehicle exceeded max session duration (24h)`,
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
      vehicleIdentity: getVehicleIdentity(e.vehicleType, e.color),
      vehicleType: e.vehicleType,
      color: e.color,
      message: `Parking detection without active session at ${e.location}`,
      timestamp: e.timestamp,
      eventId: e.id,
    });
  });

  // Rapid re-entry by vehicle identity
  const completedByIdentity: any = {};
  sessions.filter(s => s.exitTime).forEach(s => {
    if (!completedByIdentity[s.vehicleIdentity]) completedByIdentity[s.vehicleIdentity] = [];
    completedByIdentity[s.vehicleIdentity].push(s);
  });

  Object.values(completedByIdentity).forEach((identitySessions: any) => {
    identitySessions.sort((a: any, b: any) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime());
    for (let i = 0; i < identitySessions.length - 1; i++) {
      const exitTime = new Date(identitySessions[i].exitTime).getTime();
      const nextEntry = new Date(identitySessions[i + 1].entryTime).getTime();
      if (nextEntry - exitTime < 10 * 60000) {
        alertId++;
        alerts.push({
          id: `alert-${alertId}`,
          type: "RAPID_REENTRY",
          severity: "info",
          vehicleIdentity: identitySessions[i].vehicleIdentity,
          vehicleType: identitySessions[i].vehicleType,
          color: identitySessions[i].color,
          message: `Re-entered within ${Math.round((nextEntry - exitTime) / 60000)} minutes`,
          timestamp: identitySessions[i + 1].entryTime,
          sessionId: identitySessions[i + 1].id,
        });
      }
    }
  });

  alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return alerts;
}

export function computeVehicleInsights(sessions: any[], vehicleIdentity: any) {
  const vSessions = sessions.filter(s => s.vehicleIdentity === vehicleIdentity);
  const parked = vSessions.filter(s => s.status === "PARKED").length;
  const passed = vSessions.filter(s => s.status === "PASSED_THROUGH").length;
  const total = vSessions.length;
  const ratio = total > 0 ? ((parked / total) * 100).toFixed(0) : "0";

  const lastSession = vSessions[0];
  const commonEntry = mode(vSessions.map(s => s.entryGate).filter(Boolean));
  const commonExit = mode(vSessions.map(s => s.exitGate).filter(Boolean));
  const commonFlow = mode(vSessions.map(s => s.flowPattern).filter(Boolean));

  const durations = vSessions.filter(s => s.durationMinutes).map(s => s.durationMinutes);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

  return {
    vehicleIdentity,
    vehicleType: lastSession?.vehicleType,
    color: lastSession?.color,
    totalSessions: total,
    parked,
    passed,
    parkedRatio: ratio,
    avgDuration,
    lastSeen: lastSession?.entryTime || null,
    lastLocation: lastSession?.entryGate || null,
    commonEntryGate: commonEntry,
    commonExitGate: commonExit,
    commonFlowPattern: commonFlow,
    sessions: vSessions,
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
      ? Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length)
      : 0,
  }));
}

export function computeRepeatVisitors(sessions: any[], minSessions = 3) {
  const byIdentity: any = {};
  sessions.forEach(s => {
    byIdentity[s.vehicleIdentity] = (byIdentity[s.vehicleIdentity] || 0) + 1;
  });

  return Object.entries(byIdentity)
    .filter(([_, count]: any) => count >= minSessions)
    .sort((a: any, b: any) => b[1] - a[1])
    .map(([identity, count]: any) => ({
      vehicleIdentity: identity,
      sessionCount: count,
    }));
}

export function computeRankings(sessions: any[]) {
  // Rankings by vehicle type
  const parkedByType: any = {};
  const passedByType: any = {};
  const parkedByColor: any = {};
  const byIdentity: any = {};

  sessions.forEach(s => {
    const t = s.vehicleType || "Unknown";
    const c = s.color || "Unknown";
    const id = s.vehicleIdentity;

    if (s.status === "PARKED") {
      parkedByType[t] = (parkedByType[t] || 0) + 1;
      parkedByColor[c] = (parkedByColor[c] || 0) + 1;
    }
    if (s.status === "PASSED_THROUGH") {
      passedByType[t] = (passedByType[t] || 0) + 1;
    }
    byIdentity[id] = (byIdentity[id] || 0) + 1;
  });

  const topParkedTypes = Object.entries(parkedByType).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10)
    .map(([label, count]: any) => ({ label, count }));
  const topPassedTypes = Object.entries(passedByType).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10)
    .map(([label, count]: any) => ({ label, count }));
  const topColors = Object.entries(parkedByColor).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10)
    .map(([label, count]: any) => ({ label, count }));
  const topIdentities = Object.entries(byIdentity).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10)
    .map(([label, count]: any) => ({ label, count }));

  return { topParkedTypes, topPassedTypes, topColors, topIdentities };
}
