// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import SessionProvider from "./contexts/SessionProvider";
import AppProviders from "./contexts/AppProviders";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SessionProvider>
      <AppProviders>
        <App />
      </AppProviders>
    </SessionProvider>
  </StrictMode>
);
