import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { ChecklistForm } from "../components/ChecklistForm";
import { loadChecklistDefinition } from "../features/checklists/checklistApi";
import { getDraftByChecklistId, saveDraft } from "../features/checklists/checklistState";
import { getQueryParam } from "../lib/router";
import type { ChecklistAnswers, ChecklistDefinition } from "../types/checklist";

const emptyDefinition: ChecklistDefinition = {
  id: "unknown",
  title: "Checklist",
  category: "General",
  sections: []
};

export function ChecklistPage(): JSX.Element {
  const [definition, setDefinition] = useState<ChecklistDefinition>(emptyDefinition);
  const [answers, setAnswers] = useState<ChecklistAnswers>({});

  useEffect(() => {
    const id = getQueryParam("id");
    const file = getQueryParam("file");
    if (!id || !file) return;

    loadChecklistDefinition(file).then((loaded) => {
      if (!loaded) return;
      setDefinition(loaded);
      const draft = getDraftByChecklistId(id);
      if (draft) setAnswers(draft.answers);
    });
  }, []);

  return (
    <AppShell title={definition.title} subtitle={definition.category}>
      <ChecklistForm
        definition={definition}
        answers={answers}
        onChange={(fieldId, value) => {
          const next = { ...answers, [fieldId]: value };
          setAnswers(next);
          saveDraft(definition, next);
        }}
      />
    </AppShell>
  );
}
