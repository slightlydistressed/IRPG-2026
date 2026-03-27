import { NAV_ITEMS } from "../lib/constants";

interface Props {
  currentPath: string;
}

export function SideNav({ currentPath }: Props): JSX.Element {
  return (
    <nav className="side-nav card">
      <div className="side-nav__title">IRPG 2026</div>
      <ul>
        {NAV_ITEMS.map((item) => {
          const normalized = item.href.replace(/index\.html$/, "");
          const active = currentPath === item.href || currentPath === normalized;
          return (
            <li key={item.id}>
              <a className={active ? "active" : ""} href={item.href}>
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
