import type { HighlightRecord } from "../../types/highlight";

interface Props {
  highlights: HighlightRecord[];
  pageNumber: number;
}

export function PdfHighlighter({ highlights, pageNumber }: Props): JSX.Element {
  const pageHighlights = highlights.filter((item) => item.pageNumber === pageNumber);
  return (
    <div className="pdf-highlight-layer" aria-hidden="true">
      {pageHighlights.flatMap((highlight) =>
        highlight.areas
          .filter((area) => area.pageNumber === pageNumber)
          .flatMap((area) =>
            area.rects.map((rect, index) => (
              <div
                key={`${highlight.id}-${index}`}
                className="pdf-highlight-rect"
                style={{
                  left: `${rect.x}px`,
                  top: `${rect.y}px`,
                  width: `${rect.width}px`,
                  height: `${rect.height}px`,
                  background: highlight.color ?? "rgba(255,231,122,0.65)"
                }}
              />
            ))
          )
      )}
    </div>
  );
}
