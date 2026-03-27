import type { NavItem } from "../types/app";
import { withBasePath } from "./utils";

export const APP_NAME = "IRPG 2026";
export const APP_VERSION = "0.1.0";

export const STORAGE_KEYS = {
  theme: "irpg.theme",
  bookmarks: "irpg.bookmarks",
  highlights: "irpg.highlights",
  drafts: "irpg.checklistDrafts",
  recents: "irpg.recents",
  manualState: "irpg.manualState",
  settings: "irpg.settings"
} as const;

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", page: "home", href: withBasePath("index.html") },
  { id: "manual", label: "Manual", page: "manual", href: withBasePath("manual.html") },
  { id: "checklists", label: "Checklists", page: "checklists", href: withBasePath("checklists.html") },
  { id: "saved", label: "Saved", page: "saved", href: withBasePath("saved.html") },
  { id: "settings", label: "Settings", page: "settings", href: withBasePath("settings.html") }
];
