// Mock data generator for vehicle flow & parking analytics
// New topology: 3 gates (GATE_A, GATE_B, GATE_C) with IN/OUT cameras each + 2 parking cameras

const VEHICLE_TYPES = ["Sedan", "SUV", "Pickup", "Van", "Motorcycle", "Hatchback", "Truck"];
const COLORS = ["White", "Black", "Silver", "Red", "Blue", "Gray", "Green", "Brown"];

const GATE_IDS = ["GATE_A", "GATE_B", "GATE_C"];
const GATE_CAMERA_IDS = [
  "GATE_A_IN", "GATE_A_OUT",
  "GATE_B_IN", "GATE_B_OUT",
  "GATE_C_IN", "GATE_C_OUT",
];
const PARKING_CAMERA_IDS = ["PARKING_1", "PARKING_2"];

let eventIdCounter = 0;

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pre-generate 30 vehicle profiles
const VEHICLE_PROFILES = [];
for (let i = 0; i < 30; i++) {
  VEHICLE_PROFILES.push({
    vehicleType: randomFrom(VEHICLE_TYPES),
    color: randomFrom(COLORS),
  });
}

function makeGateEvent(timestamp, profile, gateId, direction, confidence?) {
  eventIdCounter++;
  const cameraId = `${gateId}_${direction}`;
  return {
    id: `evt-${eventIdCounter}`,
    timestamp: timestamp.toISOString(),
    color: profile.color,
    vehicleType: profile.vehicleType,
    locationType: "GATE",
    locationId: gateId,
    cameraId,
    direction,
    confidence: confidence ?? (Math.random() > 0.1 ? 0.8 + Math.random() * 0.2 : 0.5 + Math.random() * 0.25),
    imageUrl: undefined,
  };
}

function makeParkingEvent(timestamp, profile, confidence?) {
  eventIdCounter++;
  const cameraId = randomFrom(PARKING_CAMERA_IDS);
  return {
    id: `evt-${eventIdCounter}`,
    timestamp: timestamp.toISOString(),
    color: profile.color,
    vehicleType: profile.vehicleType,
    locationType: "PARKING",
    locationId: "PARKING",
    cameraId,
    direction: "INTERNAL",
    confidence: confidence ?? (Math.random() > 0.1 ? 0.8 + Math.random() * 0.2 : 0.5 + Math.random() * 0.25),
    imageUrl: undefined,
  };
}

function hourlyWeight(hour) {
  const weights = {
    0: 0.05, 1: 0.02, 2: 0.02, 3: 0.02, 4: 0.03, 5: 0.05,
    6: 0.1, 7: 0.2, 8: 0.4, 9: 0.35, 10: 0.25, 11: 0.3,
    12: 0.35, 13: 0.3, 14: 0.25, 15: 0.2, 16: 0.3, 17: 0.4,
    18: 0.35, 19: 0.2, 20: 0.15, 21: 0.1, 22: 0.08, 23: 0.06,
  };
  return weights[hour] || 0.1;
}

// Gate distribution weights (Gate A busiest, Gate C quietest)
function pickEntryGate() {
  const r = Math.random();
  if (r < 0.45) return "GATE_A";
  if (r < 0.80) return "GATE_B";
  return "GATE_C";
}

function pickExitGate(entryGate) {
  const r = Math.random();
  if (r < 0.4) return entryGate; // same gate exit
  const others = GATE_IDS.filter(g => g !== entryGate);
  return randomFrom(others);
}

export function generateHistoricalEvents(days = 30) {
  const events = [];
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  for (let d = 0; d < days; d++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + d);

    for (let hour = 0; hour < 24; hour++) {
      const weight = hourlyWeight(hour);
      const count = Math.round(weight * randomBetween(8, 20));

      for (let i = 0; i < count; i++) {
        const profile = randomFrom(VEHICLE_PROFILES);
        const minute = randomBetween(0, 59);
        const second = randomBetween(0, 59);

        const entryTime = new Date(dayDate);
        entryTime.setHours(hour, minute, second);

        if (entryTime > now) continue;

        const entryGate = pickEntryGate();
        events.push(makeGateEvent(entryTime, profile, entryGate, "IN"));

        const willPark = Math.random() > 0.3;

        if (willPark) {
          const parkDelay = randomBetween(1, 5);
          const parkCount = randomBetween(1, 3);
          for (let p = 0; p < parkCount; p++) {
            const parkTime = new Date(entryTime.getTime() + (parkDelay + p * 2) * 60000);
            if (parkTime > now) continue;
            events.push(makeParkingEvent(parkTime, profile));
          }

          const parkDuration = randomBetween(15, 240);
          const exitTime = new Date(entryTime.getTime() + (parkDelay + parkDuration) * 60000);
          if (exitTime <= now) {
            const exitGate = pickExitGate(entryGate);
            events.push(makeGateEvent(exitTime, profile, exitGate, "OUT"));
          }
        } else {
          const transitTime = randomBetween(2, 8);
          const exitTime = new Date(entryTime.getTime() + transitTime * 60000);
          if (exitTime <= now) {
            const exitGate = pickExitGate(entryGate);
            events.push(makeGateEvent(exitTime, profile, exitGate, "OUT"));
          }
        }
      }
    }
  }

  // Add some unknown/low-confidence parking events
  for (let i = 0; i < 15; i++) {
    const t = new Date(now.getTime() - randomBetween(1, days * 24) * 3600000);
    const unknownProfile = { vehicleType: randomFrom(VEHICLE_TYPES), color: randomFrom(COLORS) };
    events.push(makeParkingEvent(t, unknownProfile, 0.5 + Math.random() * 0.3));
  }

  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return events;
}

let liveInterval = null;
let liveCallbacks = [];

function generateLiveEvent() {
  const profile = randomFrom(VEHICLE_PROFILES);
  const now = new Date();
  const isGate = Math.random() > 0.3;
  if (isGate) {
    const gate = randomFrom(GATE_IDS);
    const dir = Math.random() > 0.5 ? "IN" : "OUT";
    return makeGateEvent(now, profile, gate, dir);
  } else {
    return makeParkingEvent(now, profile);
  }
}

export function subscribeEvents(callback) {
  liveCallbacks.push(callback);
  if (!liveInterval) {
    liveInterval = setInterval(() => {
      const event = generateLiveEvent();
      liveCallbacks.forEach(cb => cb(event));
    }, randomBetween(1000, 3000));
  }
  return () => {
    liveCallbacks = liveCallbacks.filter(cb => cb !== callback);
    if (liveCallbacks.length === 0 && liveInterval) {
      clearInterval(liveInterval);
      liveInterval = null;
    }
  };
}

export function getEvents(range, filters) {
  const allEvents = generateHistoricalEvents(30);
  let filtered = allEvents.filter(e => {
    const t = new Date(e.timestamp);
    return t >= range.start && t <= range.end;
  });

  if (filters) {
    if (filters.vehicleType) filtered = filtered.filter(e => e.vehicleType === filters.vehicleType);
    if (filters.locationId) filtered = filtered.filter(e => e.locationId === filters.locationId);
    if (filters.color) filtered = filtered.filter(e => e.color === filters.color);
  }

  return filtered;
}

let _cachedEvents = null;

export function getCachedEvents() {
  if (!_cachedEvents) {
    _cachedEvents = generateHistoricalEvents(30);
  }
  return _cachedEvents;
}

export function clearCache() {
  _cachedEvents = null;
}

export { VEHICLE_TYPES, COLORS, GATE_IDS, GATE_CAMERA_IDS, PARKING_CAMERA_IDS };
