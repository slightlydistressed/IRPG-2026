import { STORAGE_KEYS } from "../../lib/constants";
import { getStored, setStored } from "../../lib/storage";
import type { AppPreferences } from "../../types/app";

const defaults: AppPreferences = {
  theme: "system",
  reducedMotion: false,
  confirmDestructiveActions: true,
  defaultSavedTab: "bookmarks",
  lastVisitedPage: "home"
};

export function getPreferences(): AppPreferences {
  return getStored(STORAGE_KEYS.settings, defaults);
}

export function savePreferences(value: AppPreferences): void {
  setStored(STORAGE_KEYS.settings, value);
}
