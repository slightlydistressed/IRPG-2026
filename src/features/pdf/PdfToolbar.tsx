const CHEVRON_LEFT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const CHEVRON_RIGHT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const BOOKMARK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

interface Props {
  pageNumber: number;
  totalPages?: number;
  onPrev: () => void;
  onNext: () => void;
  onBookmark?: () => void;
}

export function PdfToolbar({ pageNumber, totalPages, onPrev, onNext, onBookmark }: Props): JSX.Element {
  return (
    <div className="pdf-toolbar">
      <button className="btn btn-secondary" onClick={onPrev} disabled={pageNumber <= 1}>
        {CHEVRON_LEFT} Prev
      </button>
      <div className="pdf-toolbar__page">
        Page <strong>{pageNumber}</strong>{totalPages ? ` / ${totalPages}` : ""}
      </div>
      <button className="btn btn-secondary" onClick={onNext} disabled={totalPages !== undefined && pageNumber >= totalPages}>
        Next {CHEVRON_RIGHT}
      </button>
      {onBookmark ? (
        <button className="btn btn-ghost" onClick={onBookmark} title="Bookmark this page">
          {BOOKMARK_ICON} Bookmark
        </button>
      ) : null}
    </div>
  );
}
