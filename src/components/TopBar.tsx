import { ReactNode } from "react";
import { StatusPill } from "./StatusPill";
import type { OfflineStatus } from "../types/app";

interface Props {
  title: string;
  subtitle?: string;
  offlineLabel?: string;
  actions?: ReactNode;
}

function getStatusTone(label: string): "good" | "danger" | "neutral" {
  const dangerStatuses: OfflineStatus[] = ["offline", "error"];
  return (dangerStatuses as string[]).includes(label) ? "danger" : "good";
}

export function TopBar({ title, subtitle, offlineLabel, actions }: Props): JSX.Element {
  return (
    <header className="top-bar card">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p className="subtle-text">{subtitle}</p> : null}
      </div>
      <div className="top-bar__actions">
        {offlineLabel ? <StatusPill label={offlineLabel} tone={getStatusTone(offlineLabel)} /> : null}
        {actions}
      </div>
    </header>
  );
}
