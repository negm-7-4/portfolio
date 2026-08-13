import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import AppCrashScreen from "./components/AppCrashScreen.jsx";
import { registerSW } from "./lib/registerSW";
import { installGlobalErrorReporting } from "./lib/reportError";
import { printConsoleSignature } from "./lib/consoleSignature";

/* There is no client-side router here: unknown paths are served the static
   public/404.html by the host WITH a real 404 status (vercel.json no longer
   rewrites everything to "/"), so this entry only ever renders the site. */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary label="app root" fallback={<AppCrashScreen />}>
      <App />
    </ErrorBoundary>
    <Analytics />
    <SpeedInsights />
  </StrictMode>
);

// Async failures never reach an ErrorBoundary — catch them before the app
// mounts, so a rejected chunk import is reported rather than silent.
installGlobalErrorReporting();

// Cache assets aggressively so repeat visits are instant
registerSW();
printConsoleSignature();
