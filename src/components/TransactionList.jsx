import { categoryInfo } from "../data.js";

const dayLabel = (iso) => {
  const date = new Date(`${iso}T00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today - date) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

export default function TransactionList({ transactions, format, onEdit, onDelete }) {
  if (!transactions.length) {
    return <div className="list-empty">No transactions match. Try another filter or add one.</div>;
  }

  // Group by day, newest first
  const groups = [];
  for (const t of transactions) {
    const last = groups[groups.length - 1];
    if (last && last.date === t.date) last.items.push(t);
    else groups.push({ date: t.date, items: [t] });
  }

  return (
    <div className="tx-list">
      {groups.map((g) => {
        const net = g.items.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
        return (
          <section key={g.date} className="tx-day">
            <header className="tx-day-head">
              <span>{dayLabel(g.date)}</span>
              <span className={net >= 0 ? "pos" : "neg"}>{net >= 0 ? "+" : "−"}{format(Math.abs(net))}</span>
            </header>
            <ul>
              {g.items.map((t) => {
                const c = categoryInfo(t.type, t.category);
                return (
                  <li key={t.id} className="tx">
                    <span className="tx-icon" style={{ "--c": c.color }}>{c.icon}</span>
                    <div className="tx-main">
                      <span className="tx-title">{t.note || t.category}</span>
                      <span className="tx-sub">{t.category}</span>
                    </div>
                    <span className={`tx-amount ${t.type}`}>
                      {t.type === "income" ? "+" : "−"}{format(t.amount)}
                    </span>
                    <div className="tx-actions">
                      <button className="icon-btn sm" onClick={() => onEdit(t)} aria-label={`Edit ${t.note || t.category}`}>✏️</button>
                      <button className="icon-btn sm" onClick={() => onDelete(t)} aria-label={`Delete ${t.note || t.category}`}>🗑️</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
