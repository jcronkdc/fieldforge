import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/a11y-utilities.css";
import "./styles.css";
import "./styles/futuristic.css";
import "./styles/futuristic-master.css";
import "./styles/premium-animations.css";
import "./styles/contrast-fixes.css";
import { pauseOffscreen } from "./utils/viewport-animate";

// Acquisition tests disabled for now (can be run manually)
// import "./tests/runAcquisitionTests";

if (typeof window !== "undefined") {
  window.requestAnimationFrame(() =>
    pauseOffscreen('[data-anim], [class*="animate-"]')
  );
}

// Using the production-ready version of the app
// Note: App.tsx contains its own BrowserRouter
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

