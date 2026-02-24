import { useMemo } from "react";
import { sessionizeEvents } from "@/lib/sessionize";

export function useSessions(events: any[]) {
  return useMemo(() => sessionizeEvents(events), [events]);
}
