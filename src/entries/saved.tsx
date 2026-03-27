import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/app.css";
import "../styles/layout.css";
import "../styles/theme.css";
import "../styles/saved.css";
import { SavedPage } from "../pages/SavedPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SavedPage />
  </React.StrictMode>
);
