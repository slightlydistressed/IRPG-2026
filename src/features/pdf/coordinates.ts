import type { PdfSelectionRect } from "./pdfTypes";
import type { ScaledPosition } from "../../types/highlight";

export function viewportToScaled(rect: PdfSelectionRect, pageWidth: number, pageHeight: number): ScaledPosition {
  return { ...rect, pageWidth, pageHeight };
}

export function scaledToViewport(rect: ScaledPosition, currentPageWidth: number, currentPageHeight: number): PdfSelectionRect {
  const scaleX = currentPageWidth / rect.pageWidth;
  const scaleY = currentPageHeight / rect.pageHeight;
  return {
    x: rect.x * scaleX,
    y: rect.y * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY
  };
}
