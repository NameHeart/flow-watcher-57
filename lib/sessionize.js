// Sessionization: events -> visit sessions

const MAX_SESSION_HOURS = 24;
const TOLERANCE_MS = 2 * 60 * 1000; // 2 minutes

export function sessionizeEvents(events) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const byPlate = {};
  sorted.forEach((e) => {
    if (!byPlate[e.plate]) byPlate[e.plate] = [];
    byPlate[e.plate].push(e);
  });

  const sessions = [];
  const unlinkedParking = [];
  let sessionId = 0;

  Object.entries(byPlate).forEach(([plate, plateEvents]) => {
    const gateEvents = plateEvents.filter(
      (e) => e.location === "NORTH_GATE" || e.location === "SOUTH_GATE"
    );
    const parkingEvents = plateEvents.filter((e) => e.location.startsWith("PARKING_"));

    const usedParkingIds = new Set();
    const usedGateIds = new Set();

    const inEvents = gateEvents.filter((e) => e.direction === "IN");
    const outEvents = gateEvents.filter((e) => e.direction === "OUT");

    inEvents.forEach((inEvent) => {
      if (usedGateIds.has(inEvent.id)) return;

      const inTime = new Date(inEvent.timestamp).getTime();

      const outEvent = outEvents.find((o) => {
        const oTime = new Date(o.timestamp).getTime();
        return oTime > inTime && !usedGateIds.has(o.id);
      });

      const outTime = outEvent ? new Date(outEvent.timestamp).getTime() : null;

      const now = Date.now();
      const isStale = !outEvent && now - inTime > MAX_SESSION_HOURS * 3600000;

      const sessionParkingEvents = parkingEvents.filter((p) => {
        const pTime = new Date(p.timestamp).getTime();
        const start = inTime - TOLERANCE_MS;
        const end = outTime ? outTime + TOLERANCE_MS : now;
        return pTime >= start && pTime <= end && !usedParkingIds.has(p.id);
      });

      sessionParkingEvents.forEach((p) => usedParkingIds.add(p.id));
      usedGateIds.add(inEvent.id);
      if (outEvent) usedGateIds.add(outEvent.id);

      const duplicateIns = inEvents.filter((i) => {
        const iTime = new Date(i.timestamp).getTime();
        return (
          i.id !== inEvent.id &&
          !usedGateIds.has(i.id) &&
          iTime > inTime &&
          (outTime ? iTime < outTime : true)
        );
      });
      duplicateIns.forEach((d) => usedGateIds.add(d.id));

      const entryGate = inEvent.location.replace("_GATE", "");
      const exitGate = outEvent ? outEvent.location.replace("_GATE", "") : null;
      const hasParking = sessionParkingEvents.length > 0;

      let status = "CURRENTLY_INSIDE";
      if (outEvent) {
        status = hasParking ? "PARKED" : "PASSED_THROUGH";
      } else if (isStale) {
        status = "STALE_INSIDE";
      }

      const flowPattern = exitGate ? `${entryGate[0]}->${exitGate[0]}` : null;

      sessionId++;
      sessions.push({
        id: `session-${sessionId}`,
        plate,
        vehicleType: inEvent.vehicleType,
        color: inEvent.color,
        entryGate,
        exitGate,
        flowPattern,
        status,
        entryTime: inEvent.timestamp,
        exitTime: outEvent?.timestamp || null,
        durationMinutes: outTime ? Math.round((outTime - inTime) / 60000) : null,
        parkingEvents: sessionParkingEvents,
        events: [inEvent, ...sessionParkingEvents, ...(outEvent ? [outEvent] : [])],
        confidence: Math.min(
          ...[inEvent, ...(outEvent ? [outEvent] : [])].map((e) => e.confidence || 1)
        ),
      });
    });

    parkingEvents.forEach((p) => {
      if (!usedParkingIds.has(p.id)) {
        unlinkedParking.push(p);
      }
    });
  });

  sessions.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());

  return { sessions, unlinkedParking };
}
