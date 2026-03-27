export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScaledPosition extends Position {
  pageWidth: number;
  pageHeight: number;
}

export interface ViewportPosition extends Position {
  pageNumber: number;
  scale: number;
}

export interface HighlightQuote {
  text: string;
  prefix?: string;
  suffix?: string;
}

export interface HighlightContent {
  quote: HighlightQuote;
  comment?: string;
}

export interface HighlightArea {
  pageNumber: number;
  rects: ScaledPosition[];
}

export interface HighlightRecord {
  id: string;
  documentId: string;
  pageNumber: number;
  content: HighlightContent;
  areas: HighlightArea[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HighlightSelectionPayload {
  documentId: string;
  pageNumber: number;
  text: string;
  rects: ViewportPosition[];
}

export interface HighlightExportPayload {
  type: "irpg-highlight-export";
  version: 1;
  exportedAt: string;
  documentId: string;
  highlights: HighlightRecord[];
}

export interface HighlightState {
  byId: Record<string, HighlightRecord>;
  allIds: string[];
}
