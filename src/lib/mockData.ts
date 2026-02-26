// Mock data generator for vehicle flow & parking analytics

const PLATES = [
  "ABC-1234", "XYZ-5678", "DEF-9012", "GHI-3456", "JKL-7890",
  "MNO-2345", "PQR-6789", "STU-0123", "VWX-4567", "YZA-8901",
  "BCD-2346", "EFG-5679", "HIJ-9013", "KLM-3457", "NOP-7891",
  "QRS-2348", "TUV-6780", "WXY-0124", "ZAB-4568", "CDE-8902",
  "FGH-1111", "IJK-2222", "LMN-3333", "OPQ-4444", "RST-5555",
  "UVW-6666", "XYZ-7777", "ABC-8888", "DEF-9999", "GHI-0000",
];

const VEHICLE_TYPES = ["Sedan", "SUV", "Pickup", "Van", "Motorcycle", "Hatchback", "Truck"];
const COLORS = ["White", "Black", "Silver", "Red", "Blue", "Gray", "Green", "Brown"];
const LOCATIONS = ["NORTH_GATE", "SOUTH_GATE", "PARKING_1", "PARKING_2", "PARKING_3"];
const GATE_LOCATIONS = ["NORTH_GATE", "SOUTH_GATE"];
const PARKING_LOCATIONS = ["PARKING_1", "PARKING_2", "PARKING_3"];

let eventIdCounter = 0;

function randomFrom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: any, max: any) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePlateProfile(plate: any) {
  return {
    plate,
    vehicleType: randomFrom(VEHICLE_TYPES),
    color: randomFrom(COLORS),
  };
}

const plateProfiles: any = {};
PLATES.forEach(p => { plateProfiles[p] = generatePlateProfile(p); });

function makeEvent(timestamp: any, plate: any, location: any, direction: any, confidence?: any) {
  const profile = plateProfiles[plate] || generatePlateProfile(plate);
  eventIdCounter++;
  return {
    id: `evt-${eventIdCounter}`,
    timestamp: timestamp.toISOString(),
    plate,
    color: profile.color,
    vehicleType: profile.vehicleType,
    location,
    direction,
    cameraId: `CAM-${location}`,
    confidence: confidence ?? (Math.random() > 0.1 ? 0.8 + Math.random() * 0.2 : 0.5 + Math.random() * 0.25),
    imageUrl: undefined,
  };
}

function hourlyWeight(hour: any) {
  const weights: any = {
    0: 0.05, 1: 0.02, 2: 0.02, 3: 0.02, 4: 0.03, 5: 0.05,
    6: 0.1, 7: 0.2, 8: 0.4, 9: 0.35, 10: 0.25, 11: 0.3,
    12: 0.35, 13: 0.3, 14: 0.25, 15: 0.2, 16: 0.3, 17: 0.4,
    18: 0.35, 19: 0.2, 20: 0.15, 21: 0.1, 22: 0.08, 23: 0.06,
  };
  return weights[hour] || 0.1;
}

export function generateHistoricalEvents(days = 30) {
  const events: any[] = [];
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
        const plate = randomFrom(PLATES);
        const minute = randomBetween(0, 59);
        const second = randomBetween(0, 59);

        const entryTime = new Date(dayDate);
        entryTime.setHours(hour, minute, second);

        if (entryTime > now) continue;

        const entryGate = randomFrom(GATE_LOCATIONS);
        events.push(makeEvent(entryTime, plate, entryGate, "IN"));

        const willPark = Math.random() > 0.3;

        if (willPark) {
          const parkDelay = randomBetween(1, 5);
          const parkCount = randomBetween(1, 3);
          for (let p = 0; p < parkCount; p++) {
            const parkTime = new Date(entryTime.getTime() + (parkDelay + p * 2) * 60000);
            if (parkTime > now) continue;
            events.push(makeEvent(parkTime, plate, randomFrom(PARKING_LOCATIONS), "INTERNAL"));
          }

          const parkDuration = randomBetween(15, 240);
          const exitTime = new Date(entryTime.getTime() + (parkDelay + parkDuration) * 60000);
          if (exitTime <= now) {
            const exitGate = Math.random() > 0.4 ? (entryGate === "NORTH_GATE" ? "SOUTH_GATE" : "NORTH_GATE") : entryGate;
            events.push(makeEvent(exitTime, plate, exitGate, "OUT"));
          }
        } else {
          const transitTime = randomBetween(2, 8);
          const exitTime = new Date(entryTime.getTime() + transitTime * 60000);
          if (exitTime <= now) {
            const exitGate = Math.random() > 0.3 ? (entryGate === "NORTH_GATE" ? "SOUTH_GATE" : "NORTH_GATE") : entryGate;
            events.push(makeEvent(exitTime, plate, exitGate, "OUT"));
          }
        }
      }
    }
  }

  for (let i = 0; i < 15; i++) {
    const t = new Date(now.getTime() - randomBetween(1, days * 24) * 3600000);
    const unknownPlate = `UNK-${randomBetween(1000, 9999)}`;
    plateProfiles[unknownPlate] = generatePlateProfile(unknownPlate);
    events.push(makeEvent(t, unknownPlate, randomFrom(PARKING_LOCATIONS), "INTERNAL", 0.5 + Math.random() * 0.3));
  }

  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return events;
}

let liveInterval: any = null;
let liveCallbacks: any[] = [];

function generateLiveEvent() {
  const plate = randomFrom(PLATES);
  const now = new Date();
  const isGate = Math.random() > 0.3;
  if (isGate) {
    const gate = randomFrom(GATE_LOCATIONS);
    const dir = Math.random() > 0.5 ? "IN" : "OUT";
    return makeEvent(now, plate, gate, dir);
  } else {
    return makeEvent(now, plate, randomFrom(PARKING_LOCATIONS), "INTERNAL");
  }
}

export function subscribeEvents(callback: any) {
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

export function getEvents(range: any, filters?: any) {
  const allEvents = generateHistoricalEvents(30);
  let filtered = allEvents.filter(e => {
    const t = new Date(e.timestamp);
    return t >= range.start && t <= range.end;
  });

  if (filters) {
    if (filters.plate) filtered = filtered.filter(e => e.plate.includes(filters.plate.toUpperCase()));
    if (filters.vehicleType) filtered = filtered.filter(e => e.vehicleType === filters.vehicleType);
    if (filters.location) filtered = filtered.filter(e => e.location === filters.location);
    if (filters.color) filtered = filtered.filter(e => e.color === filters.color);
  }

  return filtered;
}

let _cachedEvents: any = null;

export function getCachedEvents() {
  if (!_cachedEvents) {
    _cachedEvents = generateHistoricalEvents(30);
  }
  return _cachedEvents;
}

export function clearCache() {
  _cachedEvents = null;
}

export { PLATES, VEHICLE_TYPES, COLORS, LOCATIONS, GATE_LOCATIONS, PARKING_LOCATIONS };
