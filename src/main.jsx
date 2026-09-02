import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { initStorytellingReveals } from "./storytellingReveal.js";
import { initCustomerCopyV15 } from "./customerCopyV15.js";
import "./styles.css";
import "./hero/heroScene.css";
import "./visual-qa-fixes.css";
import "./art-direction-v3.css";
import "./process-v4.css";
import "./contact-v4.css";
import "./storytelling-v6.css";
import "./cohesion-v7.css";
import "./editorial-catalog-v12.css";
import "./apple-air-v13.css";
import "./apple-balance-v14.css";
import "./customer-first-v15.css";
import "./catalog-flow-v16.css";
import "./brand-duotone-v17.css";
import "./catalog-sharing-v18.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

window.requestAnimationFrame(() => {
  initStorytellingReveals();
  initCustomerCopyV15();
});
