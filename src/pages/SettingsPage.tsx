import { useMemo, useRef, useState } from "react";
import { AppShell } from "../components/AppShell";
import { getOfflineStatus } from "../features/offline/offlineStatus";
import { getPreferences, savePreferences } from "../features/settings/settingsApi";
import { exportJsonFile, importJsonFile } from "../lib/exportImport";
import { getBookmarks, getHighlights } from "../features/saved/savedApi";
import { getDrafts } from "../features/checklists/checklistState";
import { applyTheme } from "../lib/theme";

export function SettingsPage(): JSX.Element {
  const offline = useMemo(() => getOfflineStatus(), []);
  const [prefs, setPrefs] = useState(getPreferences());
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <AppShell title="Settings" subtitle="Theme, backup, and offline status" offlineLabel={offline.status}>
      <section className="card panel">
        <h2>Appearance</h2>
        <div className="settings-row" style={{ marginTop: "0.5rem" }}>
          <label htmlFor="theme-select">Theme</label>
          <select
            id="theme-select"
            value={prefs.theme}
            onChange={(e) => {
              const next = { ...prefs, theme: e.target.value as typeof prefs.theme };
              setPrefs(next);
              savePreferences(next);
              applyTheme();
            }}
          >
            <option value="system">System default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </section>

      <section className="card panel">
        <h2>Offline</h2>
        <p className="subtle-text" style={{ margin: "0.5rem 0" }}>{offline.message}</p>
      </section>

      <section className="card panel">
        <h2>Backup</h2>
        <p className="subtle-text" style={{ margin: "0.5rem 0 1rem" }}>Export your bookmarks, highlights, and checklist drafts as a JSON file.</p>
        <div className="button-row">
          <button
            className="btn btn-primary"
            onClick={() => exportJsonFile("irpg-backup.json", {
              exportedAt: new Date().toISOString(),
              bookmarks: getBookmarks(),
              highlights: getHighlights(),
              drafts: getDrafts(),
              preferences: prefs
            })}
          >Export backup</button>
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>Import backup</button>
          <input
            hidden
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const payload = await importJsonFile<Record<string, unknown>>(file);
              alert(`Imported backup payload keys: ${Object.keys(payload).join(", ")}`);
            }}
          />
        </div>
      </section>
    </AppShell>
  );
}
