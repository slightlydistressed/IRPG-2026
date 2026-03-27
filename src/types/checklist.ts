export type ChecklistFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "datetime-local"
  | "select"
  | "radio"
  | "checkbox"
  | "multiselect"
  | "toggle"
  | "gps"
  | "heading"
  | "note";

export type ChecklistValue = string | number | boolean | string[] | null | undefined;

export interface ChecklistOption {
  label: string;
  value: string;
  description?: string;
}

export interface ChecklistFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface ChecklistFieldVisibilityRule {
  fieldId: string;
  equals?: ChecklistValue;
  notEquals?: ChecklistValue;
  includes?: string;
  truthy?: boolean;
}

export interface ChecklistFieldAction {
  type: "set-current-date" | "set-current-time" | "set-current-datetime" | "set-gps";
  label: string;
}

export interface ChecklistFieldBase {
  id: string;
  type: ChecklistFieldType;
  label: string;
  helpText?: string;
  placeholder?: string;
  defaultValue?: ChecklistValue;
  validation?: ChecklistFieldValidation;
  visibleWhen?: ChecklistFieldVisibilityRule[];
  disabled?: boolean;
}

export interface ChecklistTextLikeField extends ChecklistFieldBase {
  type: "text" | "textarea" | "number" | "date" | "time" | "datetime-local" | "gps";
  action?: ChecklistFieldAction;
}

export interface ChecklistChoiceField extends ChecklistFieldBase {
  type: "select" | "radio" | "multiselect";
  options: ChecklistOption[];
}

export interface ChecklistCheckboxField extends ChecklistFieldBase {
  type: "checkbox" | "toggle";
}

export interface ChecklistHeadingField extends ChecklistFieldBase {
  type: "heading";
}

export interface ChecklistNoteField extends ChecklistFieldBase {
  type: "note";
  markdown?: string;
}

export type ChecklistField =
  | ChecklistTextLikeField
  | ChecklistChoiceField
  | ChecklistCheckboxField
  | ChecklistHeadingField
  | ChecklistNoteField;

export interface ChecklistSection {
  id: string;
  title: string;
  description?: string;
  fields: ChecklistField[];
}

export interface ChecklistDefinition {
  id: string;
  title: string;
  shortTitle?: string;
  description?: string;
  category: string;
  tags?: string[];
  icon?: string;
  version?: string;
  sections: ChecklistSection[];
}

export interface ChecklistIndexItem {
  id: string;
  title: string;
  category: string;
  description?: string;
  tags?: string[];
  icon?: string;
  file: string;
}

export interface ChecklistIndex {
  version?: string;
  updatedAt?: string;
  items: ChecklistIndexItem[];
}

export type ChecklistAnswers = Record<string, ChecklistValue>;

export interface ChecklistDraftMeta {
  checklistId: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  completed?: boolean;
}

export interface ChecklistDraft {
  id: string;
  checklistId: string;
  answers: ChecklistAnswers;
  meta: ChecklistDraftMeta;
}

export interface ChecklistExportPayload {
  type: "irpg-checklist-export";
  version: 1;
  exportedAt: string;
  checklistId: string;
  draft: ChecklistDraft;
}

export interface ChecklistState {
  currentChecklistId?: string;
  currentDraftId?: string;
  definitions: Record<string, ChecklistDefinition>;
  drafts: Record<string, ChecklistDraft>;
}
