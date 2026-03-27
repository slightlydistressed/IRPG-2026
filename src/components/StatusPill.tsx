interface Props {
  label: string;
  tone?: "neutral" | "good" | "danger";
}

export function StatusPill({ label, tone = "neutral" }: Props): JSX.Element {
  return <span className={`status-pill status-pill--${tone}`}>{label}</span>;
}
