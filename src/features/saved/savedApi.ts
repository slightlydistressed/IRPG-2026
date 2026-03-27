import { STORAGE_KEYS } from "../../lib/constants";
import { getStored, setStored } from "../../lib/storage";
import type { BookmarkRecord } from "../../types/toc";
import type { HighlightRecord } from "../../types/highlight";
import type { RecentItem } from "../../types/app";

export function getBookmarks(): BookmarkRecord[] {
  return getStored<BookmarkRecord[]>(STORAGE_KEYS.bookmarks, []);
}

export function saveBookmarks(items: BookmarkRecord[]): void {
  setStored(STORAGE_KEYS.bookmarks, items);
}

export function getHighlights(): HighlightRecord[] {
  return getStored<HighlightRecord[]>(STORAGE_KEYS.highlights, []);
}

export function saveHighlights(items: HighlightRecord[]): void {
  setStored(STORAGE_KEYS.highlights, items);
}

export function getRecents(): RecentItem[] {
  return getStored<RecentItem[]>(STORAGE_KEYS.recents, []);
}
