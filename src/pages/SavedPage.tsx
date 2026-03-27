import { AppShell } from "../components/AppShell";
import { BookmarkList } from "../components/BookmarkList";
import { HighlightList } from "../components/HighlightList";
import { getBookmarks, getHighlights } from "../features/saved/savedApi";

export function SavedPage(): JSX.Element {
  return (
    <AppShell title="Saved" subtitle="Bookmarks and highlights">
      <div className="two-column">
        <BookmarkList items={getBookmarks()} />
        <HighlightList items={getHighlights()} />
      </div>
    </AppShell>
  );
}
