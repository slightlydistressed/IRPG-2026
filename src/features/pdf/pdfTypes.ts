export interface PdfDocumentSource {
  id: string;
  title: string;
  url: string;
  totalPagesHint?: number;
}

export interface PdfSelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
