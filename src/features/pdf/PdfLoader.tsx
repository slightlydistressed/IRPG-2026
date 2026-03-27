import { useEffect, useState } from "react";
import type { PdfDocumentSource } from "./pdfTypes";

interface Props {
  source: PdfDocumentSource;
  children: (state: { ready: boolean; error?: string; source: PdfDocumentSource }) => JSX.Element;
}

export function PdfLoader({ source, children }: Props): JSX.Element {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    fetch(source.url, { method: "HEAD" })
      .then((response) => {
        if (!active) return;
        if (!response.ok) throw new Error(`Failed to load ${source.url}`);
        setReady(true);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [source.url]);

  return children({ ready, error, source });
}
