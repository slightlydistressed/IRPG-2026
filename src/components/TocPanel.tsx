import type { TocItem } from "../types/toc";
import { withBasePath } from "../lib/utils";

function TocNode({ item }: { item: TocItem }): JSX.Element {
  if (item.kind === "section") {
    return (
      <li>
        <strong>{item.title}</strong>
        <ul className="toc-list__children">
          {item.children.map((child) => <TocNode key={child.id} item={child} />)}
        </ul>
      </li>
    );
  }
  if (item.kind === "entry") return <li>{item.title} — p. {item.page.pageNumber}</li>;
  if (item.kind === "checklist-link") return <li><a href={withBasePath(`checklist/?id=${item.checklistId}`)}>{item.title}</a></li>;
  return <li><a href={item.href}>{item.title}</a></li>;
}

interface Props {
  items: TocItem[];
}

export function TocPanel({ items }: Props): JSX.Element {
  return (
    <section className="card panel">
      <h2>Contents</h2>
      <ul className="toc-list">
        {items.map((item) => <TocNode key={item.id} item={item} />)}
      </ul>
    </section>
  );
}
