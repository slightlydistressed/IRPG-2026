export type DocumentType = "pdf";

export interface DocumentSource {
  type: DocumentType;
  file: string;
}

export interface DocumentTocConfig {
  file: string;
}

export interface DocumentChecklistConfig {
  indexFile: string;
}

export interface DocumentFeatures {
  bookmarks: boolean;
  highlights: boolean;
  checklists: boolean;
  offline: boolean;
  importExport: boolean;
}

export interface DocumentDefinition {
  id: string;
  title: string;
  shortTitle?: string;
  version?: string;
  description?: string;
  source: DocumentSource;
  toc: DocumentTocConfig;
  checklists?: DocumentChecklistConfig;
  defaultPage?: number;
  totalPagesHint?: number;
  features: DocumentFeatures;
}

export interface DocumentsManifest {
  version?: string;
  updatedAt?: string;
  documents: DocumentDefinition[];
}

export interface ManualReaderState {
  documentId: string;
  currentPage: number;
  totalPages?: number;
  zoom: number;
  lastOpenedAt: string;
}

export interface SavedPageState {
  scrollTop?: number;
  selectedTab?: string;
}

export interface DocumentBackupPayload {
  type: "irpg-backup";
  version: 1;
  exportedAt: string;
  manual?: ManualReaderState[];
  bookmarks?: unknown[];
  highlights?: unknown[];
  checklistDrafts?: unknown[];
  preferences?: Record<string, unknown>;
}
