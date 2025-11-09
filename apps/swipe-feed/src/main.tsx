import React from "react";
import ReactDOM from "react-dom/client";
import AppSafe from "./AppSafe";
import "./styles.css";
import "./styles/futuristic.css";
import "./styles/futuristic-master.css";
import "./styles/premium-animations.css";

// Import acquisition tests for $10B valuation
import './tests/runAcquisitionTests';

// Using the production-ready safe version of the app
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppSafe />
  </React.StrictMode>
);

