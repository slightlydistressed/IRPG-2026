import type { BookmarkRecord } from "../types/toc";
import { EmptyState } from "./EmptyState";
import { withBasePath } from "../lib/utils";

interface Props {
  items: BookmarkRecord[];
}

export function BookmarkList({ items }: Props): JSX.Element {
  if (!items.length) return <EmptyState title="No bookmarks yet" description="Save important pages here." />;
  return (
    <section className="card panel">
      <h2>Bookmarks</h2>
      <ul className="simple-list">
        {items.map((item) => <li key={item.id}><a href={withBasePath(`manual.html?page=${item.pageNumber ?? 1}`)}>{item.title}</a></li>)}
      </ul>
    </section>
  );
}
