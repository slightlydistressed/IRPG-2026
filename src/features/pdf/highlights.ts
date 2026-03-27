import { uid } from "../../lib/utils";
import { saveHighlights, getHighlights } from "../saved/savedApi";
import type { HighlightSelectionPayload, HighlightRecord } from "../../types/highlight";

export function createHighlight(selection: HighlightSelectionPayload, pageWidth: number, pageHeight: number): HighlightRecord {
  return {
    id: uid("hl"),
    documentId: selection.documentId,
    pageNumber: selection.pageNumber,
    content: { quote: { text: selection.text } },
    areas: [{
      pageNumber: selection.pageNumber,
      rects: selection.rects.map((rect) => ({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        pageWidth,
        pageHeight
      }))
    }],
    color: "rgba(255, 231, 122, 0.65)",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function addHighlight(record: HighlightRecord): void {
  saveHighlights([...getHighlights(), record]);
}
