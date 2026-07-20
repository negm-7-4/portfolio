---
name: data-viz-charts
description: Comprehensive, modern reference for charts, dashboards, graphs & data visualization — D3.js, Observable Plot, Chart.js, Recharts, Apache ECharts, ApexCharts, visx (Airbnb), Nivo, Victory, Tremor (React dashboards), Highcharts, AG Charts, Plotly.js, Unovis, lightweight-charts (financial/TradingView), deck.gl & regl (GPU/large-scale & maps), and graph/network libs Cytoscape.js, sigma.js, vis-network. Use when building dashboards, analytics, KPI cards, graphs, charts (line/bar/pie/area/scatter/heatmap/candlestick), network/force graphs, geospatial/map data, large-scale GPU visualizations, or animated/interactive data displays for products and marketing. Covers install commands, when to pick each, core APIs, and gotchas.
---

# Charts & Data Visualization (modern toolkit)

For dashboards, product analytics, financial charts, network graphs and maps.

## Library map
| Need | Use |
| --- | --- |
| Bespoke / fully custom visualization | **D3.js** |
| Quick exploratory charts from data (D3 team) | **Observable Plot** |
| Simple standard charts, canvas, great defaults | **Chart.js** |
| Composable React SVG charts | **Recharts** |
| Many chart types, big datasets, canvas/SVG | **Apache ECharts** |
| Polished animated SVG charts | **ApexCharts** |
| Low-level React + D3 primitives (max control) | **visx** |
| Beautiful ready-made React charts | **Nivo** |
| Componentized, animatable React charts | **Victory** |
| Drop-in React dashboard/KPI components | **Tremor** |
| Enterprise, huge feature set | **Highcharts** / **AG Charts** |
| Scientific / 3D / statistical plots | **Plotly.js** |
| Composable, framework-agnostic | **Unovis** |
| Financial candlestick/trading charts | **lightweight-charts** |
| Millions of points, GPU, geospatial/maps | **deck.gl** / regl |
| Network / force / relationship graphs | **Cytoscape.js** / sigma.js / vis-network |

## D3.js (and Observable Plot)
```bash
npm i d3            # low-level toolkit (scales, shapes, selections)
npm i @observablehq/plot   # high-level grammar-of-graphics on top of D3
```
```js
import * as d3 from "d3";
const x = d3.scaleLinear().domain([0, d3.max(data, d => d.v)]).range([0, 400]);
// In React, use D3 for MATH (scales, d3.line()) and let React render the SVG.
```
```js
import * as Plot from "@observablehq/plot";
el.append(Plot.plot({ marks: [Plot.barY(data, { x: "name", y: "value" })] }));
```
Import D3 submodules (`d3-scale`, `d3-shape`) to keep bundles small.

## Chart.js
```bash
npm i chart.js          # + react-chartjs-2 for React
```
```js
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
new Chart(canvas, { type: "line", data: { labels, datasets: [{ data, tension: 0.4 }] }, options: { responsive: true } });
```
Destroy instances on unmount (canvas reuse errors otherwise).

## Recharts
```bash
npm i recharts
```
```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}><XAxis dataKey="name" /><YAxis /><Tooltip />
    <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={false} /></LineChart>
</ResponsiveContainer>
```
Always wrap in `ResponsiveContainer`; memoize data for large sets.

## Apache ECharts / ApexCharts
```bash
npm i echarts            # + echarts-for-react
npm i apexcharts react-apexcharts
```
```js
import * as echarts from "echarts";
const chart = echarts.init(el);
chart.setOption({ xAxis: { type: "category", data: labels }, yAxis: {}, series: [{ type: "bar", data }] });
```
ECharts handles very large datasets and exotic types (heatmap, sankey, graph, geo, candlestick); tree-shake via `echarts/core`. `chart.dispose()` on cleanup.

## visx (low-level React + D3)
```bash
npm i @visx/scale @visx/shape @visx/axis @visx/group
```
Unstyled primitives — you compose the chart and own every pixel. Best when design is fully custom but you want React + D3 math.

## Nivo / Victory / Tremor
```bash
npm i @nivo/core @nivo/line          # gorgeous defaults, SVG/Canvas/responsive
npm i victory                        # componentized, animatable charts
npm i @tremor/react                  # dashboard blocks: Card, AreaChart, BarList, KPIs
```
```jsx
import { Card, AreaChart } from "@tremor/react";
<Card><AreaChart data={data} index="date" categories={["Sales"]} /></Card>
```
Tremor = fastest path to a polished product dashboard.

## Enterprise: Highcharts / AG Charts / Plotly
```bash
npm i highcharts highcharts-react-official   # license required for commercial
npm i ag-charts-community ag-charts-react
npm i plotly.js-dist-min react-plotly.js     # scientific/statistical/3D plots
```

## Unovis / lightweight-charts
```bash
npm i @unovis/ts @unovis/react   # framework-agnostic, composable
npm i lightweight-charts          # TradingView financial candlestick/area charts, tiny & fast
```

## Large-scale & GPU: deck.gl / regl
```bash
npm i deck.gl          # millions of points, WebGL2/WebGPU, pairs with MapLibre/Mapbox
npm i regl             # functional low-level WebGL for custom GPU viz
```

## Network / graph viz
```bash
npm i cytoscape        # graph theory, layouts, large networks
npm i sigma graphology # WebGL rendering of big graphs
npm i vis-network      # easy interactive network diagrams
```

## General rules
- Pick the lightest tool that fits; reach for D3 only when no chart lib does the job.
- Tree-shake / import submodules (D3, ECharts) — full imports bloat bundles badly.
- Responsive (ResizeObserver / built-in) and accessible (labels, `role`, data-table fallback for screen readers).
- Destroy/dispose chart instances on unmount; throttle resize handlers.
- Animate on first render; disable heavy animation when re-rendering large live datasets.
- For >100k points use canvas/WebGL (ECharts/deck.gl/regl), not SVG.
