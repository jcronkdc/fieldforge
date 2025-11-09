import React from "react";
import ReactDOM from "react-dom/client";
import AppFixed from "./AppFixed";
import "./styles.css";

// Using the fixed and fully tested version of the app
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppFixed />
  </React.StrictMode>
);

