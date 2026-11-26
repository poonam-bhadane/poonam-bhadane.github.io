/* Rheinwerk Group BI dashboard
 * Loads pre-computed KPI JSON (published by the ETL) and renders KPI cards,
 * charts and tables. Fully static: no backend needed at view time.
 */

const COLORS = {
  MT: "#2f6bff",
  PW: "#17c2a4",
  EB: "#f79009",
  brand: "#2f6bff",
  brand2: "#17c2a4",
  accent: "#ff7a45",
  ink: "#1a2138",
  soft: "#5a6480",
  line: "#e6e9f2",
};
const COMPANY_NAME = { MT: "MetallTech GmbH", PW: "PolymerWerk AG", EB: "ElektroBauteile AG" };

let DATA = null;
let currentCompany = "ALL";
const charts = {};

/* ---------- formatting helpers ---------- */
const eur = (n) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const eurM = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : Math.round(n / 1e3) + "k");
const num = (n) => new Intl.NumberFormat("de-DE").format(n);
const pct = (n) => (n == null ? "-" : n.toFixed(1) + "%");

function otifPill(v) {
  const cls = v >= 90 ? "good" : v >= 80 ? "warn" : "bad";
  return `<span class="pill ${cls}">${pct(v)}</span>`;
}

/* ---------- data access with company filter ---------- */
function filteredCompanies() {
  return currentCompany === "ALL"
    ? DATA.revenue_by_company
    : DATA.revenue_by_company.filter((c) => c.company_code === currentCompany);
}

function recomputeSummary() {
  const rows = filteredCompanies();
  const revenue = rows.reduce((s, r) => s + r.revenue_eur, 0);
  const margin = rows.reduce((s, r) => s + r.margin_eur, 0);
  const lines = rows.reduce((s, r) => s + r.order_lines, 0);
  // OTIF weighted by delivered lines from otif table
  const otifRows =
    currentCompany === "ALL"
      ? DATA.otif_by_company
      : DATA.otif_by_company.filter((c) => c.company_code === currentCompany);
  const delivered = otifRows.reduce((s, r) => s + r.delivered_lines, 0);
  const otif = otifRows.reduce((s, r) => s + r.otif_lines, 0);
  const backlogRows =
    currentCompany === "ALL"
      ? DATA.order_backlog
      : DATA.order_backlog.filter((c) => c.company_code === currentCompany);
  const backlog = backlogRows.reduce((s, r) => s + r.backlog_eur, 0);
  return {
    total_revenue_eur: revenue,
    total_margin_eur: margin,
    gross_margin_pct: revenue ? (100 * margin) / revenue : 0,
    order_lines: lines,
    otif_pct: delivered ? (100 * otif) / delivered : 0,
    open_backlog_eur: backlog,
    active_customers: DATA.summary.active_customers,
  };
}

/* ---------- KPI cards ---------- */
function renderCards() {
  const s = recomputeSummary();
  const cards = [
    { label: "Group revenue", value: eur(s.total_revenue_eur), sub: `${num(s.order_lines)} order lines` },
    { label: "Gross margin", value: eur(s.total_margin_eur), sub: `<b>${pct(s.gross_margin_pct)}</b> margin` },
    { label: "Gross margin %", value: pct(s.gross_margin_pct), sub: "revenue &minus; cost" },
    { label: "OTIF delivery", value: pct(s.otif_pct), sub: "on-time &amp; in-full" },
    { label: "Open backlog", value: eur(s.open_backlog_eur), sub: "not yet delivered" },
  ];
  document.getElementById("kpi-cards").innerHTML = cards
    .map(
      (c) => `<div class="kpi">
        <div class="label">${c.label}</div>
        <div class="value">${c.value}</div>
        <div class="sub">${c.sub}</div>
      </div>`
    )
    .join("");
}

/* ---------- chart helpers ---------- */
function destroy(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}
const gridCfg = { color: COLORS.line, drawBorder: false };
const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: COLORS.soft, usePointStyle: true, boxWidth: 8, font: { size: 12 } } } },
};

function monthsFor(code) {
  const map = {};
  DATA.revenue_by_month
    .filter((r) => code === "ALL" || r.company_code === code)
    .forEach((r) => {
      map[r.year_month] = map[r.year_month] || { rev: 0, mar: 0 };
      map[r.year_month].rev += r.revenue_eur;
      map[r.year_month].mar += r.margin_eur;
    });
  const labels = Object.keys(map).sort();
  return { labels, rev: labels.map((l) => map[l].rev), mar: labels.map((l) => map[l].mar) };
}

function renderTrend() {
  destroy("trend");
  const m = monthsFor(currentCompany);
  const ctx = document.getElementById("chart-trend");
  charts.trend = new Chart(ctx, {
    type: "bar",
    data: {
      labels: m.labels,
      datasets: [
        { type: "line", label: "Margin", data: m.mar, borderColor: COLORS.accent, backgroundColor: COLORS.accent,
          tension: 0.35, borderWidth: 2, pointRadius: 0, yAxisID: "y" },
        { type: "bar", label: "Revenue", data: m.rev, backgroundColor: "rgba(47,107,255,.75)",
          borderRadius: 5, maxBarThickness: 22, yAxisID: "y" },
      ],
    },
    options: {
      ...baseOpts,
      scales: {
        y: { grid: gridCfg, ticks: { color: COLORS.soft, callback: (v) => "€" + eurM(v) } },
        x: { grid: { display: false }, ticks: { color: COLORS.soft, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
      },
      plugins: {
        ...baseOpts.plugins,
        tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${eur(c.parsed.y)}` } },
      },
    },
  });
}

function renderCompanyShare() {
  destroy("share");
  const rows = DATA.revenue_by_company;
  charts.share = new Chart(document.getElementById("chart-company-share"), {
    type: "doughnut",
    data: {
      labels: rows.map((r) => r.company_name),
      datasets: [{ data: rows.map((r) => r.revenue_eur), backgroundColor: rows.map((r) => COLORS[r.company_code]), borderWidth: 0 }],
    },
    options: {
      ...baseOpts,
      cutout: "62%",
      plugins: {
        ...baseOpts.plugins,
        legend: { position: "bottom", labels: baseOpts.plugins.legend.labels },
        tooltip: { callbacks: { label: (c) => `${c.label}: ${eur(c.parsed)}` } },
      },
    },
  });
}

function renderProductLine() {
  destroy("pl");
  const rows = DATA.revenue_by_product_line;
  charts.pl = new Chart(document.getElementById("chart-product-line"), {
    type: "bar",
    data: {
      labels: rows.map((r) => r.product_line),
      datasets: [
        { label: "Revenue", data: rows.map((r) => r.revenue_eur), backgroundColor: "rgba(47,107,255,.8)", borderRadius: 5 },
        { label: "Margin", data: rows.map((r) => r.margin_eur), backgroundColor: "rgba(23,194,164,.8)", borderRadius: 5 },
      ],
    },
    options: {
      ...baseOpts,
      scales: {
        y: { grid: gridCfg, ticks: { color: COLORS.soft, callback: (v) => "€" + eurM(v) } },
        x: { grid: { display: false }, ticks: { color: COLORS.soft } },
      },
      plugins: { ...baseOpts.plugins, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${eur(c.parsed.y)}` } } },
    },
  });
}

function renderMargin() {
  destroy("margin");
  const rows = DATA.revenue_by_company;
  charts.margin = new Chart(document.getElementById("chart-margin"), {
    type: "bar",
    data: {
      labels: rows.map((r) => r.company_name),
      datasets: [{ label: "Gross margin %", data: rows.map((r) => r.margin_pct), backgroundColor: rows.map((r) => COLORS[r.company_code]), borderRadius: 6, maxBarThickness: 46 }],
    },
    options: {
      ...baseOpts,
      indexAxis: "y",
      plugins: { ...baseOpts.plugins, legend: { display: false }, tooltip: { callbacks: { label: (c) => `${pct(c.parsed.x)}` } } },
      scales: {
        x: { grid: gridCfg, ticks: { color: COLORS.soft, callback: (v) => v + "%" }, suggestedMax: 60 },
        y: { grid: { display: false }, ticks: { color: COLORS.ink } },
      },
    },
  });
}

function renderCompanyBar() {
  destroy("cbar");
  const rows = DATA.revenue_by_company;
  charts.cbar = new Chart(document.getElementById("chart-company-bar"), {
    type: "bar",
    data: {
      labels: rows.map((r) => r.company_name),
      datasets: [{ label: "Revenue", data: rows.map((r) => r.revenue_eur), backgroundColor: rows.map((r) => COLORS[r.company_code]), borderRadius: 6, maxBarThickness: 60 }],
    },
    options: {
      ...baseOpts,
      plugins: { ...baseOpts.plugins, legend: { display: false }, tooltip: { callbacks: { label: (c) => eur(c.parsed.y) } } },
      scales: {
        y: { grid: gridCfg, ticks: { color: COLORS.soft, callback: (v) => "€" + eurM(v) } },
        x: { grid: { display: false }, ticks: { color: COLORS.ink } },
      },
    },
  });
}

function renderCompanyTrend() {
  destroy("ctrend");
  const codes = ["MT", "PW", "EB"];
  const allMonths = [...new Set(DATA.revenue_by_month.map((r) => r.year_month))].sort();
  const datasets = codes.map((code) => {
    const byMonth = {};
    DATA.revenue_by_month.filter((r) => r.company_code === code).forEach((r) => (byMonth[r.year_month] = r.revenue_eur));
    return {
      label: COMPANY_NAME[code],
      data: allMonths.map((m) => byMonth[m] || 0),
      borderColor: COLORS[code],
      backgroundColor: COLORS[code],
      tension: 0.35, borderWidth: 2, pointRadius: 0,
    };
  });
  charts.ctrend = new Chart(document.getElementById("chart-company-trend"), {
    type: "line",
    data: { labels: allMonths, datasets },
    options: {
      ...baseOpts,
      scales: {
        y: { grid: gridCfg, ticks: { color: COLORS.soft, callback: (v) => "€" + eurM(v) } },
        x: { grid: { display: false }, ticks: { color: COLORS.soft, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
      },
      plugins: { ...baseOpts.plugins, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${eur(c.parsed.y)}` } } },
    },
  });
}

function renderOtif() {
  destroy("otif");
  const rows = DATA.otif_by_company;
  charts.otif = new Chart(document.getElementById("chart-otif"), {
    type: "bar",
    data: {
      labels: rows.map((r) => r.company_name),
      datasets: [{ label: "OTIF %", data: rows.map((r) => r.otif_pct), backgroundColor: rows.map((r) => COLORS[r.company_code]), borderRadius: 6, maxBarThickness: 60 }],
    },
    options: {
      ...baseOpts,
      plugins: { ...baseOpts.plugins, legend: { display: false }, tooltip: { callbacks: { label: (c) => pct(c.parsed.y) } } },
      scales: {
        y: { grid: gridCfg, ticks: { color: COLORS.soft, callback: (v) => v + "%" }, suggestedMin: 60, suggestedMax: 100 },
        x: { grid: { display: false }, ticks: { color: COLORS.ink } },
      },
    },
  });
}

function renderAttainment() {
  destroy("attain");
  const rows = DATA.production_vs_plan;
  charts.attain = new Chart(document.getElementById("chart-attainment"), {
    type: "bar",
    data: {
      labels: rows.map((r) => r.company_name),
      datasets: [
        { label: "Planned", data: rows.map((r) => r.planned_qty), backgroundColor: "rgba(90,100,128,.35)", borderRadius: 5 },
        { label: "Actual", data: rows.map((r) => r.actual_qty), backgroundColor: "rgba(47,107,255,.85)", borderRadius: 5 },
      ],
    },
    options: {
      ...baseOpts,
      scales: {
        y: { grid: gridCfg, ticks: { color: COLORS.soft, callback: (v) => num(v) } },
        x: { grid: { display: false }, ticks: { color: COLORS.ink } },
      },
      plugins: { ...baseOpts.plugins, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${num(c.parsed.y)} units` } } },
    },
  });
}

/* ---------- tables ---------- */
function renderCompanyTable() {
  const rows = DATA.revenue_by_company;
  const max = Math.max(...rows.map((r) => r.revenue_eur));
  document.getElementById("table-companies").innerHTML = `
    <thead><tr>
      <th>Subsidiary</th><th class="num">Revenue</th><th>Share</th>
      <th class="num">Margin</th><th class="num">Margin %</th>
      <th class="num">Order lines</th><th class="num">OTIF</th>
    </tr></thead>
    <tbody>${rows
      .map(
        (r) => `<tr>
        <td><b>${r.company_name}</b></td>
        <td class="num">${eur(r.revenue_eur)}</td>
        <td><div class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:${(100 * r.revenue_eur) / max}%"></div></div></div></td>
        <td class="num">${eur(r.margin_eur)}</td>
        <td class="num">${pct(r.margin_pct)}</td>
        <td class="num">${num(r.order_lines)}</td>
        <td class="num">${otifPill(r.otif_pct)}</td>
      </tr>`
      )
      .join("")}</tbody>`;
}

function renderBacklogTable() {
  const rows = DATA.order_backlog;
  document.getElementById("table-backlog").innerHTML = `
    <thead><tr><th>Subsidiary</th><th class="num">Open lines</th><th class="num">Backlog value</th></tr></thead>
    <tbody>${rows
      .map((r) => `<tr><td><b>${r.company_name}</b></td><td class="num">${num(r.open_lines)}</td><td class="num">${eur(r.backlog_eur)}</td></tr>`)
      .join("")}</tbody>`;
}

function renderCustomerTable() {
  const rows = DATA.top_customers;
  const max = Math.max(...rows.map((r) => r.revenue_eur));
  document.getElementById("table-customers").innerHTML = `
    <thead><tr>
      <th>Group customer</th><th>ID</th><th>Type</th>
      <th class="num">Subsidiaries</th><th class="num">Revenue</th><th>Share</th>
    </tr></thead>
    <tbody>${rows
      .map(
        (r) => `<tr>
        <td><b>${r.customer_name}</b></td>
        <td><code>${r.group_customer_id}</code></td>
        <td>${r.is_shared_account ? '<span class="pill shared">Shared</span>' : '<span class="pill">Single</span>'}</td>
        <td class="num">${r.subsidiaries_traded_with}</td>
        <td class="num">${eur(r.revenue_eur)}</td>
        <td><div class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:${(100 * r.revenue_eur) / max}%"></div></div></div></td>
      </tr>`
      )
      .join("")}</tbody>`;
}

function renderBuildStats() {
  const s = DATA.build_stats;
  const items = [
    { n: s.companies, t: "Subsidiaries" },
    { n: s.customers, t: "Customer records" },
    { n: s.products, t: "Products" },
    { n: num(s.sales_lines), t: "Sales fact rows" },
    { n: num(s.production_lines), t: "Production rows" },
    { n: s.shared_accounts, t: "Shared accounts resolved" },
  ];
  document.getElementById("build-stats").innerHTML = items
    .map((i) => `<div class="stat"><div class="n">${i.n}</div><div class="t">${i.t}</div></div>`)
    .join("");
}

/* ---------- view switching ---------- */
const VIEW_META = {
  overview: ["Group Overview", "Consolidated performance across all subsidiaries &middot; all figures in EUR"],
  companies: ["By Subsidiary", "Compare revenue, margin and delivery performance across the group"],
  operations: ["Operations", "Delivery reliability, production attainment and open backlog"],
  customers: ["Customers", "Group-wide customer view after cross-subsidiary identity resolution"],
  architecture: ["Data Model", "How fragmented source systems become one uniform group warehouse"],
};

function switchView(view) {
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  document.getElementById("view-" + view).classList.remove("hidden");
  document.getElementById("view-title").innerHTML = VIEW_META[view][0];
  document.getElementById("view-sub").innerHTML = VIEW_META[view][1];
  // KPI cards only make sense on data views
  document.getElementById("kpi-cards").style.display = view === "architecture" ? "none" : "grid";
}

/* ---------- boot ---------- */
function renderAll() {
  renderCards();
  renderTrend();
  renderCompanyShare();
  renderProductLine();
  renderMargin();
  renderCompanyTable();
  renderCompanyBar();
  renderCompanyTrend();
  renderOtif();
  renderAttainment();
  renderBacklogTable();
  renderCustomerTable();
  renderBuildStats();
}

async function init() {
  try {
    const res = await fetch("data/kpis.json");
    DATA = await res.json();
  } catch (e) {
    document.getElementById("view-sub").textContent =
      "Could not load data/kpis.json. Serve this folder over HTTP (see README).";
    return;
  }

  // populate filter
  const sel = document.getElementById("company-filter");
  DATA.revenue_by_company.forEach((c) => {
    const o = document.createElement("option");
    o.value = c.company_code;
    o.textContent = c.company_name;
    sel.appendChild(o);
  });
  sel.addEventListener("change", (e) => {
    currentCompany = e.target.value;
    renderCards();
    renderTrend();
  });

  document.querySelectorAll(".nav-item").forEach((b) =>
    b.addEventListener("click", () => switchView(b.dataset.view))
  );

  const d = new Date(DATA.generated_at);
  document.getElementById("refreshed-at").textContent =
    "Updated " + d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  Chart.defaults.font.family = "'Inter', sans-serif";
  renderAll();
}

init();
