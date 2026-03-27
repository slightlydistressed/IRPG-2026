import { fetchJson, withBasePath } from "../../lib/utils";
import type { ChecklistDefinition, ChecklistIndex } from "../../types/checklist";

export async function loadChecklistIndex(): Promise<ChecklistIndex> {
  return fetchJson<ChecklistIndex>(withBasePath("data/checklists/index.json"), { items: [] });
}

export async function loadChecklistDefinition(file: string): Promise<ChecklistDefinition | null> {
  return fetchJson<ChecklistDefinition | null>(file, null);
}
