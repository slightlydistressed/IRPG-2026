import { useMemo, useRef, useState } from "react";
import { AppShell } from "../components/AppShell";
import { getOfflineStatus } from "../features/offline/offlineStatus";
import { getPreferences, savePreferences } from "../features/settings/settingsApi";
import { exportJsonFile, importJsonFile } from "../lib/exportImport";
import { getBookmarks, getHighlights } from "../features/saved/savedApi";
import { getDrafts } from "../features/checklists/checklistState";

export function SettingsPage(): JSX.Element {
  const offline = useMemo(() => getOfflineStatus(), []);
  const [prefs, setPrefs] = useState(getPreferences());
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <AppShell title="Settings" subtitle="Theme, backup, and offline status" offlineLabel={offline.status}>
      <section className="card panel">
        <h2>Theme</h2>
        <select
          value={prefs.theme}
          onChange={(e) => {
            const next = { ...prefs, theme: e.target.value as typeof prefs.theme };
            setPrefs(next);
            savePreferences(next);
          }}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </section>

      <section className="card panel">
        <h2>Offline</h2>
        <p>{offline.message}</p>
      </section>

      <section className="card panel">
        <h2>Backup</h2>
        <div className="button-row">
          <button onClick={() => exportJsonFile("irpg-backup.json", {
            exportedAt: new Date().toISOString(),
            bookmarks: getBookmarks(),
            highlights: getHighlights(),
            drafts: getDrafts(),
            preferences: prefs
          })}>Export backup</button>
          <button onClick={() => fileRef.current?.click()}>Import backup</button>
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
