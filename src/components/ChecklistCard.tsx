import type { ChecklistIndexItem } from "../types/checklist";
import { withBasePath } from "../lib/utils";

interface Props {
  item: ChecklistIndexItem;
}

export function ChecklistCard({ item }: Props): JSX.Element {
  return (
    <a className="checklist-card card" href={withBasePath(`checklist/?id=${item.id}&file=${encodeURIComponent(item.file)}`)}>
      <h3>{item.title}</h3>
      <p>{item.description ?? item.category}</p>
      <span className="subtle-text">{item.category}</span>
    </a>
  );
}
