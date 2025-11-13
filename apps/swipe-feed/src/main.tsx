import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppSafe from "./AppSafe";
import "./styles/tokens.css";
import "./styles/a11y-utilities.css";
import "./styles.css";
import "./styles/futuristic.css";
import "./styles/futuristic-master.css";
import "./styles/premium-animations.css";
import "./styles/contrast-fixes.css";
import "./styles/davinci.css"; // Leonardo da Vinci Renaissance theme - MUST BE LAST to override
import { pauseOffscreen } from "./utils/viewport-animate";

// Import acquisition tests for $10B valuation
import "./tests/runAcquisitionTests";

if (typeof window !== "undefined") {
  window.requestAnimationFrame(() =>
    pauseOffscreen('[data-anim], [class*="animate-"]')
  );
}

// Using the production-ready safe version of the app
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppSafe />
    </BrowserRouter>
  </React.StrictMode>
);

