import { ReactNode } from "react";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerActions?: ReactNode;
  offlineLabel?: string;
}

export function AppShell({ title, subtitle, children, headerActions, offlineLabel }: Props): JSX.Element {
  return (
    <div className="app-shell">
      <aside className="app-shell__nav">
        <SideNav currentPath={window.location.pathname} />
      </aside>
      <main className="app-shell__main">
        <TopBar title={title} subtitle={subtitle} offlineLabel={offlineLabel} actions={headerActions} />
        <div className="app-shell__content">{children}</div>
      </main>
    </div>
  );
}
