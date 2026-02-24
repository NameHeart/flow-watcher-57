import { useState, useEffect, useCallback, useRef } from "react";
import { subscribeEvents } from "@/lib/mockData";

export function useLiveMode() {
  const [isLive, setIsLive] = useState(false);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const maxEvents = 100;

  useEffect(() => {
    if (!isLive) return;

    const unsub = subscribeEvents((event) => {
      setLiveEvents(prev => [event, ...prev].slice(0, maxEvents));
    });

    return unsub;
  }, [isLive]);

  const toggleLive = useCallback(() => {
    setIsLive(prev => !prev);
    if (isLive) setLiveEvents([]);
  }, [isLive]);

  return { isLive, liveEvents, toggleLive };
}
