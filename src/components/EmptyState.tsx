interface Props {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: Props): JSX.Element {
  return (
    <div className="empty-state card">
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
