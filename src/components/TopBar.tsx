import { ReactNode } from "react";
import { StatusPill } from "./StatusPill";

interface Props {
  title: string;
  subtitle?: string;
  offlineLabel?: string;
  actions?: ReactNode;
}

export function TopBar({ title, subtitle, offlineLabel, actions }: Props): JSX.Element {
  return (
    <header className="top-bar card">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p className="subtle-text">{subtitle}</p> : null}
      </div>
      <div className="top-bar__actions">
        {offlineLabel ? <StatusPill label={offlineLabel} tone="good" /> : null}
        {actions}
      </div>
    </header>
  );
}
