// Analytics functions — pure, backend-ready (3-gate + 2-parking topology)

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

  const totalParking = events.filter(e => e.locationType === "PARKING").length;

  const hourCounts = {};
  sessions.forEach(s => {
    const h = new Date(s.entryTime).getHours();
    const key = `${h}:00`;
    hourCounts[key] = (hourCounts[key] || 0) + 1;
  });
  const peakHour = Object.entries(hourCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A";

  return { totalEntered, parked, passedThrough, currentlyInside, avgParkedDuration, peakHour, totalParking };
}

export function computeGateTrends(events: any[], granularity: any) {
  const grouped = {};

  events.filter(e => e.locationType === "GATE").forEach(e => {
    const d = new Date(e.timestamp);
    const key = granularity === "hourly"
      ? format(startOfHour(d), "yyyy-MM-dd HH:mm")
      : format(startOfDay(d), "yyyy-MM-dd");

    if (!grouped[key]) grouped[key] = { totalIn: 0, totalOut: 0, gateA_in: 0, gateA_out: 0, gateB_in: 0, gateB_out: 0, gateC_in: 0, gateC_out: 0 };

    const g = grouped[key];
    if (e.direction === "IN") {
      g.totalIn++;
      if (e.locationId === "GATE_A") g.gateA_in++;
      if (e.locationId === "GATE_B") g.gateB_in++;
      if (e.locationId === "GATE_C") g.gateC_in++;
    } else if (e.direction === "OUT") {
      g.totalOut++;
      if (e.locationId === "GATE_A") g.gateA_out++;
      if (e.locationId === "GATE_B") g.gateB_out++;
      if (e.locationId === "GATE_C") g.gateC_out++;
    }
  });

  return Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, val]: any) => ({
      time: key,
      label: granularity === "hourly" ? key.split(" ")[1] : format(new Date(key), "MMM dd"),
      ...val,
    }));
}

export function computeParkingTrends(events: any[], granularity: any) {
  const grouped = {};

  events.filter(e => e.locationType === "PARKING").forEach(e => {
    const d = new Date(e.timestamp);
    const key = granularity === "hourly"
      ? format(startOfHour(d), "yyyy-MM-dd HH:mm")
      : format(startOfDay(d), "yyyy-MM-dd");

    if (!grouped[key]) grouped[key] = { total: 0, parking1: 0, parking2: 0 };
    grouped[key].total++;
    if (e.cameraId === "PARKING_1") grouped[key].parking1++;
    if (e.cameraId === "PARKING_2") grouped[key].parking2++;
  });

  return Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, val]: any) => ({
      time: key,
      label: granularity === "hourly" ? key.split(" ")[1] : format(new Date(key), "MMM dd"),
      ...val,
    }));
}

export function computeGateLoad(events: any[]) {
  const gates = {
    GATE_A: { inCount: 0, outCount: 0 },
    GATE_B: { inCount: 0, outCount: 0 },
    GATE_C: { inCount: 0, outCount: 0 },
  };

  events.filter(e => e.locationType === "GATE").forEach(e => {
    if (gates[e.locationId]) {
      if (e.direction === "IN") gates[e.locationId].inCount++;
      if (e.direction === "OUT") gates[e.locationId].outCount++;
    }
  });

  return [
    { gate: "Gate A", gateId: "GATE_A", ...gates.GATE_A },
    { gate: "Gate B", gateId: "GATE_B", ...gates.GATE_B },
    { gate: "Gate C", gateId: "GATE_C", ...gates.GATE_C },
  ];
}

export function computeParkingLoad(events: any[]) {
  let parking1 = 0;
  let parking2 = 0;
  events.filter(e => e.locationType === "PARKING").forEach(e => {
    if (e.cameraId === "PARKING_1") parking1++;
    if (e.cameraId === "PARKING_2") parking2++;
  });
  return { total: parking1 + parking2, parking1, parking2 };
}

export function computeVehicleTypeByDirection(events: any[]) {
  const byType: any = {};

  events.forEach(e => {
    const t = e.vehicleType || "Unknown";
    if (!byType[t]) byType[t] = { type: t, inCount: 0, outCount: 0, parkingCount: 0, total: 0 };
    byType[t].total++;
    if (e.locationType === "GATE" && e.direction === "IN") byType[t].inCount++;
    else if (e.locationType === "GATE" && e.direction === "OUT") byType[t].outCount++;
    else if (e.locationType === "PARKING") byType[t].parkingCount++;
  });

  return Object.values(byType).sort((a: any, b: any) => b.total - a.total);
}

export function computeFlowDistribution(sessions: any[]) {
  const flows = {};

  sessions.filter(s => s.flowPattern).forEach(s => {
    if (!flows[s.flowPattern]) flows[s.flowPattern] = { total: 0, parked: 0, passed: 0 };
    flows[s.flowPattern].total++;
    if (s.status === "PARKED") flows[s.flowPattern].parked++;
    if (s.status === "PASSED_THROUGH") flows[s.flowPattern].passed++;
  });

  return Object.entries(flows)
    .map(([pattern, counts]: any) => ({ pattern, ...counts }))
    .sort((a, b) => b.total - a.total);
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
      message: `Low confidence (${((e.confidence || 0) * 100).toFixed(0)}%) at ${e.cameraId}`,
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
      message: `Parking detection without session at ${e.cameraId}`,
      timestamp: e.timestamp,
      eventId: e.id,
    });
  });

  // Rapid re-entry
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
          message: `Re-entered within ${Math.round((nextEntry - exitTime) / 60000)} min`,
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

export function computeGatePeakHours(events: any[]) {
  const gateHours: any = { GATE_A: {}, GATE_B: {}, GATE_C: {} };

  events.filter(e => e.locationType === "GATE" && e.direction === "IN").forEach(e => {
    const h = new Date(e.timestamp).getHours();
    const key = `${h}:00`;
    if (gateHours[e.locationId]) {
      gateHours[e.locationId][key] = (gateHours[e.locationId][key] || 0) + 1;
    }
  });

  const result = {};
  Object.entries(gateHours).forEach(([gate, hours]: any) => {
    const sorted = Object.entries(hours).sort((a: any, b: any) => b[1] - a[1]);
    result[gate] = sorted[0] ? { hour: sorted[0][0], count: sorted[0][1] } : { hour: "N/A", count: 0 };
  });

  return result;
}
