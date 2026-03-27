import { STORAGE_KEYS } from "./constants";
import { getStored } from "./storage";

type ThemeChoice = "system" | "light" | "dark";

function resolvedTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice === "dark") return "dark";
  if (choice === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(): void {
  const prefs = getStored<{ theme?: ThemeChoice }>(STORAGE_KEYS.settings, {});
  const theme = resolvedTheme(prefs.theme ?? "system");
  document.documentElement.setAttribute("data-theme", theme);
}

export function watchSystemTheme(): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const listener = () => applyTheme();
  mq.addEventListener("change", listener);
  return () => mq.removeEventListener("change", listener);
}
