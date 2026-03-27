import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
}

const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

export function EmptyState({ title, description, icon }: Props): JSX.Element {
  return (
    <div className="empty-state card">
      <div className="empty-state__icon">{icon ?? DEFAULT_ICON}</div>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
