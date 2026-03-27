import { useMemo, useState } from "react";
import { uid } from "../../lib/utils";
import { PdfLoader } from "./PdfLoader";
import { PdfToolbar } from "./PdfToolbar";
import { PdfHighlighter } from "./PdfHighlighter";
import type { PdfDocumentSource } from "./pdfTypes";
import type { BookmarkRecord } from "../../types/toc";
import type { HighlightRecord } from "../../types/highlight";

interface Props {
  source: PdfDocumentSource;
  bookmarks?: BookmarkRecord[];
  highlights?: HighlightRecord[];
  onAddBookmark?: (bookmark: BookmarkRecord) => void;
  initialPage?: number;
}

export function PdfReader({ source, bookmarks = [], highlights = [], onAddBookmark, initialPage = 1 }: Props): JSX.Element {
  const [pageNumber, setPageNumber] = useState(initialPage);
  const pageBookmarks = useMemo(
    () => bookmarks.filter((item) => item.pageNumber === pageNumber),
    [bookmarks, pageNumber]
  );

  return (
    <PdfLoader source={source}>
      {({ ready, error }) => {
        if (error) return <div className="card panel">PDF failed to load: {error}</div>;
        if (!ready) return <div className="card panel">Loading PDF…</div>;

        return (
          <div className="pdf-reader">
            <PdfToolbar
              pageNumber={pageNumber}
              totalPages={source.totalPagesHint}
              onPrev={() => setPageNumber((value) => Math.max(1, value - 1))}
              onNext={() => setPageNumber((value) => value + 1)}
              onBookmark={onAddBookmark ? () => onAddBookmark({
                id: uid("bm"),
                documentId: source.id,
                tocItemId: `page-${pageNumber}`,
                title: `${source.title} — Page ${pageNumber}`,
                pageNumber,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }) : undefined}
            />
            <div className="pdf-stage">
              <iframe className="pdf-frame" src={`${source.url}#page=${pageNumber}`} title={source.title} />
              <PdfHighlighter highlights={highlights} pageNumber={pageNumber} />
            </div>
            <div className="panel subtle-text">Bookmarks on this page: {pageBookmarks.length}</div>
          </div>
        );
      }}
    </PdfLoader>
  );
}
