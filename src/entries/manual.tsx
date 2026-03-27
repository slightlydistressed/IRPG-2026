import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/app.css";
import "../styles/layout.css";
import "../styles/theme.css";
import "../styles/manual.css";
import "../styles/pdf_viewer.css";
import { ManualPage } from "../pages/ManualPage";
import { registerServiceWorker } from "../lib/registerSW";
import { applyTheme, watchSystemTheme } from "../lib/theme";

applyTheme();
watchSystemTheme();
registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ManualPage />
  </React.StrictMode>
);
