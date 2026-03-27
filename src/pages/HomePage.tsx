import { AppShell } from "../components/AppShell";
import { StatusPill } from "../components/StatusPill";
import { getOfflineStatus } from "../features/offline/offlineStatus";
import { withBasePath } from "../lib/utils";

export function HomePage(): JSX.Element {
  const offline = getOfflineStatus();

  return (
    <AppShell title="IRPG 2026" subtitle="Offline-capable wildfire field reference" offlineLabel={offline.status}>
      <section className="grid">
        <a className="card launcher-card" href={withBasePath("manual.html")}><h2>Open Manual</h2><p>Read the IRPG PDF guide.</p></a>
        <a className="card launcher-card" href={withBasePath("checklists.html")}><h2>Open Checklists</h2><p>Fill out operational worksheets.</p></a>
        <a className="card launcher-card" href={withBasePath("saved.html")}><h2>Saved Items</h2><p>Return to bookmarks and highlights.</p></a>
        <a className="card launcher-card" href={withBasePath("settings.html")}><h2>Settings</h2><p>Theme, backup, and offline status.</p></a>
      </section>
      <section className="card panel">
        <h2>Field status</h2>
        <p>Use the hosted site in a browser, allow it to cache, then rely on it offline.</p>
        <StatusPill label={offline.status} tone={offline.status === "error" ? "danger" : "good"} />
      </section>
    </AppShell>
  );
}
