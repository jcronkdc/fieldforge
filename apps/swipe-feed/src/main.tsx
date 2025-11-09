import React from "react";
import ReactDOM from "react-dom/client";
import AppSafe from "./AppSafe";
import "./styles.css";
import "./styles/futuristic.css";

// Using the production-ready safe version of the app
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppSafe />
  </React.StrictMode>
);

