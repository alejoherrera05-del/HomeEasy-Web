import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";
import "./hero/heroScene.css";
import "./visual-qa-fixes.css";
import "./art-direction-v3.css";
import "./process-v4.css";
import "./contact-v4.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
