import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./index.css";
import App from "./App.jsx";
import NotFound from "./components/NotFound.jsx";
import { registerSW } from "./lib/registerSW";

const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
const page = pathname === "/" || pathname === "/index.html" ? <App /> : <NotFound />;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {page}
    <Analytics />
    <SpeedInsights />
  </StrictMode>
);

// Cache assets aggressively so repeat visits are instant
registerSW();
