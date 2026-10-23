import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Read theme colors from CSS so charts match light and dark mode
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function CategoryChart({ data, format }) {
  if (!data.length) return <div className="chart-empty">No expenses this month yet</div>;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="donut-wrap">
      <div className="donut">
        <Doughnut
          data={{
            labels: data.map((d) => d.label),
            datasets: [{
              data: data.map((d) => d.value),
              backgroundColor: data.map((d) => d.color),
              borderColor: cssVar("--surface"),
              borderWidth: 3,
              hoverOffset: 6,
            }],
          }}
          options={{
            cutout: "68%",
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${format(ctx.parsed)}` } },
            },
          }}
        />
        <div className="donut-center">
          <span className="muted">Spent</span>
          <strong>{format(total)}</strong>
        </div>
      </div>
      <ul className="legend">
        {data.map((d) => (
          <li key={d.label}>
            <span className="swatch" style={{ background: d.color }} />
            <span className="legend-label">{d.icon} {d.label}</span>
            <span className="legend-value">{format(d.value)}</span>
            <span className="legend-pct">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrendChart({ months, format }) {
  const text = cssVar("--muted");
  const grid = cssVar("--border");

  return (
    <div className="bar-chart">
      <Bar
        data={{
          labels: months.map((m) => m.label),
          datasets: [
            { label: "Income", data: months.map((m) => m.income), backgroundColor: cssVar("--income"), borderRadius: 6, maxBarThickness: 26 },
            { label: "Expenses", data: months.map((m) => m.expense), backgroundColor: cssVar("--expense"), borderRadius: 6, maxBarThickness: 26 },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          scales: {
            x: { grid: { display: false }, ticks: { color: text } },
            y: {
              grid: { color: grid },
              border: { display: false },
              ticks: { color: text, callback: (v) => format(v, { compact: true }) },
            },
          },
          plugins: {
            legend: { position: "top", align: "end", labels: { color: text, boxWidth: 10, boxHeight: 10, useBorderRadius: true, borderRadius: 3 } },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${format(ctx.parsed.y)}` } },
          },
        }}
      />
    </div>
  );
}
