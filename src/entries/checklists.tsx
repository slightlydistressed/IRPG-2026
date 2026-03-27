import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/app.css";
import "../styles/layout.css";
import "../styles/theme.css";
import "../styles/checklists.css";
import { ChecklistsPage } from "../pages/ChecklistsPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChecklistsPage />
  </React.StrictMode>
);
