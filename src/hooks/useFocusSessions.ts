import { useEffect, useState } from "react";
import { loadFocusSessions, saveFocusSessions } from "../services/storage";
import type { FocusSession } from "../types/activity";

export function useFocusSessions() {
  const [sessions, setSessions] = useState<FocusSession[]>(() => loadFocusSessions());

  useEffect(() => {
    saveFocusSessions(sessions);
  }, [sessions]);

  return {
    sessions,
    addSession: (session: FocusSession) => setSessions((current) => [session, ...current])
  };
}
