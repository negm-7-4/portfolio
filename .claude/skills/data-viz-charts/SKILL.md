---
name: data-viz-charts
description: Reference and code patterns for charts & data visualization libraries — D3.js, Chart.js, Recharts, Apache ECharts, and ApexCharts. Use when building dashboards, analytics, graphs, charts (line/bar/pie/area/scatter/heatmap), data-driven SVG/canvas visualizations, or animated/interactive data displays for products and marketing. Covers install commands, when to pick each, core APIs, and gotchas.
---

# Charts & Data Visualization

For dashboards, product analytics, and data-driven visuals.

## Picking a library
- **D3.js** — low-level, maximum control. Build *any* custom/bespoke visualization (force graphs, maps, custom layouts). Steepest curve. Not a chart library — a toolkit.
- **Chart.js** — simple, canvas-based, great defaults. Fast path for standard line/bar/pie/doughnut/radar charts.
- **Recharts** — React-native, composable SVG charts built on D3. Default for React dashboards needing standard charts with JSX.
- **Apache ECharts** — feature-rich canvas/SVG charts; huge chart types (heatmap, sankey, graph, geo, candlestick), handles large datasets well.
- **ApexCharts** — polished, animated SVG charts with good interactivity; `react-apexcharts` wrapper. Nice for marketing dashboards.

## D3.js
```bash
npm i d3
```
```js
import * as d3 from "d3";
const x = d3.scaleLinear().domain([0, d3.max(data, d => d.v)]).range([0, 400]);
const svg = d3.select(el).append("svg").attr("width", 420).attr("height", 200);
svg.selectAll("rect").data(data).join("rect")
   .attr("y", (_, i) => i * 24).attr("width", d => x(d.v)).attr("height", 20).attr("fill", "#38bdf8");
```
In React, prefer letting React own the DOM and using D3 only for math (scales, shapes, `d3.line()`), or isolate D3 DOM manipulation inside a `useEffect` with cleanup. Import only submodules you use (`d3-scale`, `d3-shape`) to keep bundles small.

## Chart.js
```bash
npm i chart.js
```
```js
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
new Chart(canvas, { type: "line", data: { labels, datasets: [{ data, tension: 0.4 }] }, options: { responsive: true } });
```
React: use `react-chartjs-2`. Destroy chart instances on unmount to avoid canvas reuse errors.

## Recharts
```bash
npm i recharts
```
```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <XAxis dataKey="name" /><YAxis /><Tooltip />
    <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={false} />
  </LineChart>
</ResponsiveContainer>
```
Always wrap in `ResponsiveContainer`. Memoize data; Recharts re-renders can be heavy with large datasets.

## Apache ECharts
```bash
npm i echarts          # + echarts-for-react for React
```
```js
import * as echarts from "echarts";
const chart = echarts.init(el);
chart.setOption({ xAxis: { type: "category", data: labels }, yAxis: {}, series: [{ type: "bar", data }] });
window.addEventListener("resize", () => chart.resize());
```
Best for very large datasets and exotic chart types. Import only needed modules (tree-shakable `echarts/core`) to cut bundle size. `chart.dispose()` on cleanup.

## ApexCharts
```bash
npm i apexcharts react-apexcharts
```
```jsx
import Chart from "react-apexcharts";
<Chart type="area" height={300}
  series={[{ name: "Sales", data: [30, 40, 35, 50, 49, 60] }]}
  options={{ chart: { toolbar: { show: false } }, stroke: { curve: "smooth" } }} />
```

## General rules
- Pick the lightest tool that does the job; reach for D3 only when no chart lib fits.
- Tree-shake / import submodules (D3, ECharts) — full imports bloat bundles badly.
- Make charts responsive (ResizeObserver / built-in responsive options) and accessible (labels, `role`, data tables for screen readers).
- Destroy/dispose chart instances on unmount; throttle resize handlers.
- Animate on first render but disable heavy animation when re-rendering large live datasets.
