"use client";

import { useMemo } from "react";
import { getCachedEvents } from "@/lib/mockData";
import { subDays, startOfDay } from "date-fns";

export function useEvents(timeRange = "30days") {
  const allEvents = useMemo(() => getCachedEvents(), []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    let start;
    switch (timeRange) {
      case "today":
        start = startOfDay(now);
        break;
      case "7days":
        start = startOfDay(subDays(now, 7));
        break;
      case "30days":
      default:
        start = startOfDay(subDays(now, 30));
    }
    return allEvents.filter((e) => new Date(e.timestamp) >= start && new Date(e.timestamp) <= now);
  }, [allEvents, timeRange]);

  return { events: filteredEvents, allEvents };
}
