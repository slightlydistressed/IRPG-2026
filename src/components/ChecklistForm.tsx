import type { ChecklistAnswers, ChecklistDefinition, ChecklistField, ChecklistValue } from "../types/checklist";

interface Props {
  definition: ChecklistDefinition;
  answers: ChecklistAnswers;
  onChange: (fieldId: string, value: ChecklistValue) => void;
}

function FieldControl({
  field,
  value,
  onChange
}: {
  field: ChecklistField;
  value: ChecklistValue;
  onChange: (value: ChecklistValue) => void;
}): JSX.Element | null {
  if (field.type === "heading") return <h3 className="checklist-section-heading">{field.label}</h3>;
  if (field.type === "note") return <p className="subtle-text">{field.markdown ?? field.label}</p>;

  switch (field.type) {
    case "textarea":
      return <textarea id={field.id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "select":
      return (
        <select id={field.id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      );
    case "checkbox":
    case "toggle":
      return <input id={field.id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />;
    case "number":
      return <input id={field.id} type="number" value={Number(value ?? 0)} onChange={(e) => onChange(Number(e.target.value))} />;
    default:
      return <input id={field.id} type="text" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
}

export function ChecklistForm({ definition, answers, onChange }: Props): JSX.Element {
  const fields = definition.sections.flatMap((section) => section.fields);
  return (
    <div className="checklist-form card">
      <h2>{definition.title}</h2>
      {definition.description ? <p className="subtle-text">{definition.description}</p> : null}
      <div className="checklist-fields">
        {fields.map((field) => (
          <label className="checklist-field" key={field.id} htmlFor={field.id}>
            <span>{field.label}</span>
            <FieldControl field={field} value={answers[field.id]} onChange={(value) => onChange(field.id, value)} />
            {field.helpText ? <small>{field.helpText}</small> : null}
          </label>
        ))}
      </div>
    </div>
  );
}
