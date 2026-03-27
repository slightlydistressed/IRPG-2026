import type { HighlightRecord } from "../types/highlight";
import { EmptyState } from "./EmptyState";
import { withBasePath } from "../lib/utils";

interface Props {
  items: HighlightRecord[];
}

export function HighlightList({ items }: Props): JSX.Element {
  if (!items.length) return <EmptyState title="No highlights yet" description="Saved highlights will appear here." />;
  return (
    <section className="card panel">
      <h2>Highlights</h2>
      <ul className="simple-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={withBasePath(`manual.html?page=${item.pageNumber}`)}>{item.content.quote.text.slice(0, 100) || `Page ${item.pageNumber}`}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
