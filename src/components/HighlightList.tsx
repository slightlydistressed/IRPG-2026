import type { HighlightRecord } from "../types/highlight";
import { EmptyState } from "./EmptyState";
import { withBasePath } from "../lib/utils";

const HIGHLIGHT_EMPTY_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

interface Props {
  items: HighlightRecord[];
}

export function HighlightList({ items }: Props): JSX.Element {
  if (!items.length) return <EmptyState icon={HIGHLIGHT_EMPTY_ICON} title="No highlights yet" description="Saved highlights will appear here." />;
  return (
    <section className="card panel">
      <h2>Highlights</h2>
      <ul className="simple-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={withBasePath(`manual.html?page=${item.pageNumber}`)}>
              {item.content.quote.text.slice(0, 100) || `Page ${item.pageNumber}`}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
