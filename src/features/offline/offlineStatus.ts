import type { OfflineCacheDetails } from "../../types/app";

export function getOfflineStatus(): OfflineCacheDetails {
  const online = navigator.onLine;
  return {
    status: online ? "ready" : "offline",
    message: online ? "Connected. Cache availability depends on service worker setup." : "Offline mode detected.",
    lastUpdated: new Date().toISOString()
  };
}
