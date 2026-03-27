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
      <button onClick={onPrev} disabled={pageNumber <= 1}>Previous</button>
      <div className="pdf-toolbar__page">Page {pageNumber}{totalPages ? ` / ${totalPages}` : ""}</div>
      <button onClick={onNext} disabled={totalPages !== undefined && pageNumber >= totalPages}>Next</button>
      {onBookmark ? <button onClick={onBookmark}>Bookmark</button> : null}
    </div>
  );
}
