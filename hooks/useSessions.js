"use client";

import { useMemo } from "react";
import { sessionizeEvents } from "@/lib/sessionize";

export function useSessions(events) {
  return useMemo(() => sessionizeEvents(events), [events]);
}
