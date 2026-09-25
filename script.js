const data = {
  years: ["FY2022", "FY2023", "FY2024", "FY2025", "FY2026"],
  revenue: {
    label: "Revenue",
    unit: "USD billions",
    values: [46.710, 51.217, 51.362, 46.309, 46.398],
    format: v => `$${v.toFixed(1)}B`,
    summary: "Revenue stabilized in FY2026 after a sharp decline in FY2025."
  },
  netIncome: {
    label: "Net income",
    unit: "USD billions",
    values: [6.046, 5.070, 5.700, 3.219, 3.108],
    format: v => `$${v.toFixed(1)}B`,
    summary: "Net income remains materially below FY2024 despite stable FY2026 revenue."
  },
  grossMargin: {
    label: "Gross margin",
    unit: "Percent of revenue",
    values: [46.0, 43.5, 44.6, 42.7, 42.9],
    format: v => `${v.toFixed(1)}%`,
    summary: "FY2026 gross margin improved 20 bps, but remains below the FY2022–FY2024 range."
  },
  operatingCashFlow: {
    label: "Operating cash flow",
    unit: "USD billions",
    values: [5.188, 5.841, 7.429, 3.698, 2.868],
    format: v => `$${v.toFixed(1)}B`,
    summary: "Operating cash flow has fallen sharply from the FY2024 peak."
  }
};

const svg = document.getElementById("lineChart");
const title = document.getElementById("chartTitle");
const unit = document.getElementById("chartUnit");
const summary = document.getElementById("chartSummary");
const legend = document.getElementById("chartLegend");
const tabs = [...document.querySelectorAll(".metric-tab")];

const NS = "http://www.w3.org/2000/svg";
const W = 860, H = 360;
const pad = { left: 68, right: 30, top: 24, bottom: 54 };

function el(name, attrs = {}, text = "") {
  const node = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (text) node.textContent = text;
  return node;
}

function render(metricKey) {
  const metric = data[metricKey];
  svg.innerHTML = "";
  title.textContent = metric.label;
  unit.textContent = metric.unit;
  summary.textContent = metric.summary;

  const values = metric.values;
  let min = Math.min(...values), max = Math.max(...values);
  const spread = Math.max(max - min, Math.abs(max) * .12, 1);
  min = Math.max(0, min - spread * .25);
  max = max + spread * .25;

  const x = i => pad.left + i * ((W - pad.left - pad.right) / (values.length - 1));
  const y = v => pad.top + (max - v) * ((H - pad.top - pad.bottom) / (max - min));

  const gridGroup = el("g", {"aria-hidden": "true"});
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const val = min + (max - min) * (i / ticks);
    const yy = y(val);
    gridGroup.appendChild(el("line", {x1: pad.left, x2: W - pad.right, y1: yy, y2: yy, stroke: "#deded9", "stroke-width": "1"}));
    gridGroup.appendChild(el("text", {x: pad.left - 12, y: yy + 4, "text-anchor": "end", fill: "#7a7a74", "font-size": "11"}, metric.format(val)));
  }
  svg.appendChild(gridGroup);

  data.years.forEach((yr, i) => {
    svg.appendChild(el("text", {x: x(i), y: H - 20, "text-anchor": "middle", fill: "#7a7a74", "font-size": "11"}, yr));
  });

  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  svg.appendChild(el("polyline", {points, fill: "none", stroke: "#111111", "stroke-width": "4", "stroke-linecap": "round", "stroke-linejoin": "round"}));

  values.forEach((v, i) => {
    const cx = x(i), cy = y(v);
    svg.appendChild(el("circle", {cx, cy, r: "6", fill: "#ffffff", stroke: "#111111", "stroke-width": "3"}));
    const labelY = cy - 16;
    svg.appendChild(el("text", {x: cx, y: labelY, "text-anchor": "middle", fill: "#111111", "font-size": "12", "font-weight": "700"}, metric.format(v)));
  });

  const start = values[0], end = values[values.length - 1];
  const pct = ((end / start) - 1) * 100;
  const direction = pct >= 0 ? "+" : "";
  legend.textContent = `${data.years[0]} → ${data.years[data.years.length - 1]}: ${direction}${pct.toFixed(1)}%`;
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    render(tab.dataset.metric);
  });
});

render("revenue");
