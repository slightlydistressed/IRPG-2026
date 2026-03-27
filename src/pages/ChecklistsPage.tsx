import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { ChecklistCard } from "../components/ChecklistCard";
import { loadChecklistIndex } from "../features/checklists/checklistApi";
import type { ChecklistIndex } from "../types/checklist";

export function ChecklistsPage(): JSX.Element {
  const [index, setIndex] = useState<ChecklistIndex>({ items: [] });

  useEffect(() => {
    loadChecklistIndex().then(setIndex);
  }, []);

  return (
    <AppShell title="Checklists" subtitle="Operational forms and worksheets">
      <section className="grid">
        {index.items.map((item) => <ChecklistCard key={item.id} item={item} />)}
      </section>
    </AppShell>
  );
}
