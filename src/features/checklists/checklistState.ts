import { STORAGE_KEYS } from "../../lib/constants";
import { getStored, setStored } from "../../lib/storage";
import { uid } from "../../lib/utils";
import type { ChecklistAnswers, ChecklistDefinition, ChecklistDraft } from "../../types/checklist";

export function getDrafts(): ChecklistDraft[] {
  return getStored<ChecklistDraft[]>(STORAGE_KEYS.drafts, []);
}

export function getDraftByChecklistId(id: string): ChecklistDraft | undefined {
  return getDrafts().find((item) => item.checklistId === id);
}

export function saveDraft(definition: ChecklistDefinition, answers: ChecklistAnswers): ChecklistDraft {
  const drafts = getDrafts();
  const existing = drafts.find((item) => item.checklistId === definition.id);
  const next: ChecklistDraft = existing ?? {
    id: uid("draft"),
    checklistId: definition.id,
    answers: {},
    meta: {
      checklistId: definition.id,
      title: definition.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  next.answers = answers;
  next.meta.updatedAt = new Date().toISOString();
  const updated = drafts.filter((item) => item.id !== next.id).concat(next);
  setStored(STORAGE_KEYS.drafts, updated);
  return next;
}
