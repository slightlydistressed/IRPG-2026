import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/app.css";
import "../styles/layout.css";
import "../styles/theme.css";
import "../styles/manual.css";
import "../styles/pdf_viewer.css";
import { ManualPage } from "../pages/ManualPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ManualPage />
  </React.StrictMode>
);
