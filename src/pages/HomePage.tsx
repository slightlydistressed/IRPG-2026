import { AppShell } from "../components/AppShell";
import { StatusPill } from "../components/StatusPill";
import { getOfflineStatus } from "../features/offline/offlineStatus";
import { withBasePath } from "../lib/utils";

const BOOK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const CHECKLIST_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const BOOKMARK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const SETTINGS_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const ARROW_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

interface LaunchItem {
  href: string;
  icon: JSX.Element;
  title: string;
  description: string;
}

const LAUNCH_ITEMS: LaunchItem[] = [
  { href: withBasePath("manual.html"), icon: BOOK_ICON, title: "Open Manual", description: "Read the IRPG PDF guide." },
  { href: withBasePath("checklists.html"), icon: CHECKLIST_ICON, title: "Checklists", description: "Fill out operational worksheets." },
  { href: withBasePath("saved.html"), icon: BOOKMARK_ICON, title: "Saved Items", description: "Return to bookmarks and highlights." },
  { href: withBasePath("settings.html"), icon: SETTINGS_ICON, title: "Settings", description: "Theme, backup, and offline status." }
];

export function HomePage(): JSX.Element {
  const offline = getOfflineStatus();

  return (
    <AppShell title="IRPG 2026" subtitle="Offline-capable wildfire field reference" offlineLabel={offline.status}>
      <section className="grid">
        {LAUNCH_ITEMS.map((item) => (
          <a key={item.href} className="card launcher-card" href={item.href}>
            <div className="launcher-card__icon">{item.icon}</div>
            <div className="launcher-card__body">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
            <div className="launcher-card__arrow">{ARROW_ICON}</div>
          </a>
        ))}
      </section>
      <section className="card panel">
        <h2 style={{ marginBottom: "0.5rem" }}>Field status</h2>
        <p className="subtle-text" style={{ marginBottom: "0.75rem" }}>Use the hosted site in a browser, allow it to cache, then rely on it offline.</p>
        <StatusPill label={offline.status} tone={offline.status === "error" ? "danger" : "good"} />
      </section>
    </AppShell>
  );
}
