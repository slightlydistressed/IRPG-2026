import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { TocPanel } from "../components/TocPanel";
import { PdfReader } from "../features/pdf/PdfReader";
import { fetchJson, withBasePath } from "../lib/utils";
import { getBookmarks, getHighlights, saveBookmarks } from "../features/saved/savedApi";
import type { TocDocument, BookmarkRecord } from "../types/toc";
import type { PdfDocumentSource } from "../features/pdf/pdfTypes";

const fallbackToc: TocDocument = { documentId: "irpg", title: "IRPG", items: [] };

export function ManualPage(): JSX.Element {
  const [toc, setToc] = useState<TocDocument>(fallbackToc);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>(getBookmarks());

  useEffect(() => {
    fetchJson<TocDocument>(withBasePath("data/toc/irpg-toc.json"), fallbackToc).then(setToc);
  }, []);

  const source: PdfDocumentSource = { id: "irpg", title: "IRPG Manual", url: withBasePath("pdf/pms461.pdf") };

  return (
    <AppShell title="Manual" subtitle="PDF reader and contents">
      <div className="two-column">
        <TocPanel items={toc.items} />
        <PdfReader
          source={source}
          bookmarks={bookmarks}
          highlights={getHighlights()}
          onAddBookmark={(bookmark) => {
            const next = [...bookmarks, bookmark];
            setBookmarks(next);
            saveBookmarks(next);
          }}
        />
      </div>
    </AppShell>
  );
}
