import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/app.css";
import "../styles/layout.css";
import "../styles/theme.css";
import "../styles/checklist.css";
import { ChecklistPage } from "../pages/ChecklistPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChecklistPage />
  </React.StrictMode>
);
