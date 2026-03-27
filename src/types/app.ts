export type ThemeMode = "light" | "dark" | "system";

export type AppPage =
  | "home"
  | "manual"
  | "checklists"
  | "saved"
  | "settings"
  | "checklist";

export type SavedTab = "bookmarks" | "highlights" | "recents";

export type OfflineStatus =
  | "unknown"
  | "checking"
  | "ready"
  | "caching"
  | "updating"
  | "offline"
  | "error";

export type SyncState = "idle" | "saving" | "saved" | "error";

export interface RouteQuery {
  [key: string]: string | undefined;
}

export interface AppRoute {
  page: AppPage;
  pathname: string;
  query: RouteQuery;
}

export interface NavItem {
  id: string;
  label: string;
  page: AppPage;
  href: string;
  icon?: string;
  badge?: number;
  disabled?: boolean;
}

export interface RecentItemBase {
  id: string;
  label: string;
  updatedAt: string;
}

export interface RecentManualItem extends RecentItemBase {
  kind: "manual";
  pageNumber: number;
  documentId: string;
}

export interface RecentChecklistItem extends RecentItemBase {
  kind: "checklist";
  checklistId: string;
  draftId?: string;
}

export interface RecentSavedItem extends RecentItemBase {
  kind: "saved";
  savedType: "bookmark" | "highlight";
  refId: string;
}

export type RecentItem = RecentManualItem | RecentChecklistItem | RecentSavedItem;

export interface OfflineCacheDetails {
  status: OfflineStatus;
  version?: string;
  lastUpdated?: string;
  message?: string;
  progressPercent?: number;
}

export interface ToastMessage {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
  durationMs?: number;
}

export interface AppPreferences {
  theme: ThemeMode;
  reducedMotion: boolean;
  confirmDestructiveActions: boolean;
  lastVisitedPage?: AppPage;
  defaultSavedTab?: SavedTab;
}

export interface AppSessionState {
  route: AppRoute;
  offline: OfflineCacheDetails;
  syncState: SyncState;
  isOnline: boolean;
}

export interface AppEnvironment {
  appName: string;
  appVersion: string;
  buildTime?: string;
  platform: "web" | "ios" | "android" | "desktop";
  isPwa: boolean;
  isStandalone: boolean;
}

export interface AppShellState {
  leftNavOpen: boolean;
  secondaryPanelOpen: boolean;
  secondaryPanelMode?: "contents" | "bookmarks" | "checklists" | "saved";
}

export interface AppState {
  environment: AppEnvironment;
  preferences: AppPreferences;
  session: AppSessionState;
  shell: AppShellState;
  recents: RecentItem[];
}
