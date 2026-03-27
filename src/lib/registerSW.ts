import { withBasePath } from "./utils";

export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(withBasePath("sw.js"))
      .catch((err: unknown) => {
        console.warn("Service worker registration failed:", err);
      });
  });
}
