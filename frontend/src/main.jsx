import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

// Reseta os estilos do #root definidos no index.css padrão do Vite
// que quebram o layout da aplicação (display:flex, text-align:center, etc.)
const rootEl = document.getElementById("root");
if (rootEl) {
  rootEl.style.cssText =
    "width:100%;max-width:100%;margin:0;text-align:left;display:block;min-height:100vh;border:none;";
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);