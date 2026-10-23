import { useCallback, useEffect, useMemo, useState } from "react";
import Budgets from "./components/Budgets.jsx";
import { CategoryChart, TrendChart } from "./components/Charts.jsx";
import TransactionForm from "./components/TransactionForm.jsx";
import TransactionList from "./components/TransactionList.jsx";
import {
  CURRENCIES, DEFAULT_BUDGETS, EXPENSE_CATEGORIES, INCOME_CATEGORIES,
  categoryInfo, demoTransactions, monthKey, monthLabel, newId, shiftMonth,
} from "./data.js";
import { useLocalStorage } from "./useLocalStorage.js";

const systemTheme = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const sortByDate = (list) =>
  [...list].sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));

export default function App() {
  const [transactions, setTransactions] = useLocalStorage("spendly:transactions", demoTransactions);
  const [budgets, setBudgets] = useLocalStorage("spendly:budgets", DEFAULT_BUDGETS);
  const [currency, setCurrency] = useLocalStorage("spendly:currency", "USD");
  const [theme, setTheme] = useLocalStorage("spendly:theme", systemTheme);
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [filters, setFilters] = useState({ type: "all", category: "all", search: "" });
  const [editing, setEditing] = useState(null); // null | {} (new) | transaction
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const format = useCallback(
    (value, { compact = false } = {}) => {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          notation: compact ? "compact" : "standard",
          maximumFractionDigits: compact ? 1 : 2,
        }).format(value);
      } catch {
        return `${value.toFixed(2)} ${currency}`;
      }
    },
    [currency]
  );

  // ---------- numbers for the selected month ----------
  const monthTx = useMemo(() => transactions.filter((t) => t.date.startsWith(month)), [transactions, month]);
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;
  const balance = transactions.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);

  const prevMonth = shiftMonth(month, -1);
  const prevExpense = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(prevMonth))
    .reduce((s, t) => s + t.amount, 0);
  const expenseChange = prevExpense > 0 ? Math.round(((expense - prevExpense) / prevExpense) * 100) : null;

  const spentByCategory = useMemo(() => {
    const map = {};
    for (const t of monthTx) if (t.type === "expense") map[t.category] = (map[t.category] ?? 0) + t.amount;
    return map;
  }, [monthTx]);

  const categoryData = Object.entries(spentByCategory)
    .map(([label, value]) => ({ label, value, ...categoryInfo("expense", label) }))
    .sort((a, b) => b.value - a.value);

  const trend = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const key = shiftMonth(month, i - 5);
        const list = transactions.filter((t) => t.date.startsWith(key));
        return {
          label: monthLabel(key, "short").split(" ")[0],
          income: list.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
          expense: list.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        };
      }),
    [transactions, month]
  );

  const filtered = monthTx.filter((t) => {
    if (filters.type !== "all" && t.type !== filters.type) return false;
    if (filters.category !== "all" && t.category !== filters.category) return false;
    const q = filters.search.trim().toLowerCase();
    return !q || t.note.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  // ---------- actions ----------
  const save = (tx) => {
    if (tx.id) {
      setTransactions((list) => sortByDate(list.map((t) => (t.id === tx.id ? tx : t))));
    } else {
      setTransactions((list) => sortByDate([{ ...tx, id: newId() }, ...list]));
      if (!tx.date.startsWith(month)) setMonth(tx.date.slice(0, 7));
    }
    setEditing(null);
  };

  const remove = (tx) => {
    setTransactions((list) => list.filter((t) => t.id !== tx.id));
    setToast({ message: `Deleted “${tx.note || tx.category}”`, undo: () => setTransactions((list) => sortByDate([...list, tx])) });
  };

  const exportCsv = () => {
    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [["Date", "Type", "Category", "Amount", "Currency", "Note"]]
      .concat(sortByDate(transactions).map((t) => [t.date, t.type, t.category, t.amount.toFixed(2), currency, t.note]));
    const blob = new Blob([rows.map((r) => r.map(escape).join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spendly-transactions-${monthKey(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetDemo = () => {
    if (window.confirm("Replace all transactions and budgets with the demo data?")) {
      setTransactions(demoTransactions());
      setBudgets(DEFAULT_BUDGETS);
      setMonth(monthKey(new Date()));
    }
  };

  const clearAll = () => {
    if (window.confirm("Delete ALL transactions? This cannot be undone.")) setTransactions([]);
  };

  const closeForm = useCallback(() => setEditing(null), []);
  const isCurrentMonth = month === monthKey(new Date());
  const allCategories = { ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="logo">💸</span>
          <div>
            <h1>Spendly</h1>
            <p className="muted">Know where your money goes</p>
          </div>
        </div>
        <div className="header-actions">
          <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Currency">
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle dark mode" title="Toggle dark mode">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button className="btn primary" onClick={() => setEditing({})}>+ Add</button>
        </div>
      </header>

      <div className="month-bar">
        <button className="icon-btn" onClick={() => setMonth(prevMonth)} aria-label="Previous month">‹</button>
        <h2>{monthLabel(month)}</h2>
        <button className="icon-btn" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month">›</button>
        {!isCurrentMonth && <button className="btn ghost sm" onClick={() => setMonth(monthKey(new Date()))}>This month</button>}
      </div>

      <section className="stats">
        <div className="stat hero">
          <span className="stat-label">Total balance</span>
          <strong className="stat-value">{format(balance)}</strong>
          <span className="stat-sub">across all months</span>
        </div>
        <div className="stat">
          <span className="stat-label">Income</span>
          <strong className="stat-value pos">{format(income)}</strong>
          <span className="stat-sub">{monthTx.filter((t) => t.type === "income").length} payments</span>
        </div>
        <div className="stat">
          <span className="stat-label">Expenses</span>
          <strong className="stat-value neg">{format(expense)}</strong>
          <span className="stat-sub">
            {expenseChange === null ? "—" : (
              <span className={expenseChange > 0 ? "neg" : "pos"}>
                {expenseChange > 0 ? "▲" : "▼"} {Math.abs(expenseChange)}% vs last month
              </span>
            )}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Saved</span>
          <strong className={`stat-value ${net >= 0 ? "pos" : "neg"}`}>{format(net)}</strong>
          <span className="stat-sub">{income > 0 ? `${savingsRate}% of income` : "no income yet"}</span>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <div className="card-head"><h3>Spending by category</h3></div>
          <CategoryChart key={`${theme}-${month}`} data={categoryData} format={format} />
        </div>
        <div className="card">
          <div className="card-head"><h3>Last 6 months</h3></div>
          <TrendChart key={theme} months={trend} format={format} />
        </div>
      </section>

      <section className="grid wide-left">
        <div className="card">
          <div className="card-head">
            <h3>Transactions <span className="muted">· {filtered.length}</span></h3>
          </div>
          <div className="filters">
            <input
              className="input"
              type="search"
              placeholder="Search notes…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              aria-label="Search transactions"
            />
            <select className="select" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))} aria-label="Filter by type">
              <option value="all">All types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
            <select className="select" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))} aria-label="Filter by category">
              <option value="all">All categories</option>
              {Object.entries(allCategories).map(([name, c]) => <option key={name} value={name}>{c.icon} {name}</option>)}
            </select>
          </div>
          <TransactionList transactions={filtered} format={format} onEdit={setEditing} onDelete={remove} />
        </div>

        <div className="side">
          <Budgets budgets={budgets} spent={spentByCategory} format={format} onChange={setBudgets} />
          <div className="card">
            <div className="card-head"><h3>Data</h3></div>
            <div className="data-actions">
              <button className="btn ghost" onClick={exportCsv}>⬇️ Export CSV</button>
              <button className="btn ghost" onClick={resetDemo}>↺ Load demo data</button>
              <button className="btn danger" onClick={clearAll}>🗑️ Delete all</button>
            </div>
            <p className="muted small">Your data is saved only in this browser.</p>
          </div>
        </div>
      </section>

      <footer className="footer">Spendly · built with React, Vite and Chart.js</footer>

      <button className="fab" onClick={() => setEditing({})} aria-label="Add transaction">+</button>

      {editing && <TransactionForm initial={editing.id ? editing : null} onSave={save} onClose={closeForm} />}

      {toast && (
        <div className="toast" role="status">
          <span>{toast.message}</span>
          <button className="toast-action" onClick={() => { toast.undo(); setToast(null); }}>Undo</button>
        </div>
      )}
    </div>
  );
}
