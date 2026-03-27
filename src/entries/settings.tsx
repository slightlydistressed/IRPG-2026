import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/app.css";
import "../styles/layout.css";
import "../styles/theme.css";
import "../styles/settings.css";
import { SettingsPage } from "../pages/SettingsPage";
import { registerServiceWorker } from "../lib/registerSW";
import { applyTheme, watchSystemTheme } from "../lib/theme";

applyTheme();
watchSystemTheme();
registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SettingsPage />
  </React.StrictMode>
);
