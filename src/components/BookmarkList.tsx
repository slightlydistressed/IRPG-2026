import type { BookmarkRecord } from "../types/toc";
import { EmptyState } from "./EmptyState";
import { withBasePath } from "../lib/utils";

const BOOKMARK_EMPTY_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

interface Props {
  items: BookmarkRecord[];
}

export function BookmarkList({ items }: Props): JSX.Element {
  if (!items.length) return <EmptyState icon={BOOKMARK_EMPTY_ICON} title="No bookmarks yet" description="Save important pages while reading the manual." />;
  return (
    <section className="card panel">
      <h2>Bookmarks</h2>
      <ul className="simple-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={withBasePath(`manual.html?page=${item.pageNumber ?? 1}`)}>{item.title}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
