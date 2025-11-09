import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App";
import AppDiagnostic from "./AppDiagnostic";
import "./styles.css";

// TEMPORARY: Using diagnostic app to debug landing page issue
// To restore normal app, uncomment App and comment AppDiagnostic
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppDiagnostic />
  </React.StrictMode>
);

