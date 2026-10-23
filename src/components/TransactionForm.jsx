import { useEffect, useRef, useState } from "react";
import { categoriesFor, isoDate } from "../data.js";

export default function TransactionForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    type: initial?.type ?? "expense",
    amount: initial?.amount?.toString() ?? "",
    category: initial?.category ?? "Food",
    date: initial?.date ?? isoDate(new Date()),
    note: initial?.note ?? "",
  }));
  const [error, setError] = useState("");
  const amountRef = useRef(null);

  useEffect(() => {
    amountRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const categories = Object.entries(categoriesFor(form.type));

  const setType = (type) =>
    setForm((f) => ({
      ...f,
      type,
      category: categoriesFor(type)[f.category] ? f.category : Object.keys(categoriesFor(type))[0],
    }));

  const submit = (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than 0");
      return amountRef.current?.focus();
    }
    if (!form.date) return setError("Pick a date");
    onSave({ ...initial, ...form, amount: Math.round(amount * 100) / 100, note: form.note.trim() });
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} aria-labelledby="form-title" role="dialog" aria-modal="true">
        <header className="modal-head">
          <h2 id="form-title">{initial?.id ? "Edit transaction" : "Add transaction"}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="segmented" role="radiogroup" aria-label="Type">
          {["expense", "income"].map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={form.type === t}
              className={`seg ${form.type === t ? `active ${t}` : ""}`}
              onClick={() => setType(t)}
            >
              {t === "expense" ? "− Expense" : "+ Income"}
            </button>
          ))}
        </div>

        <label className="field">
          <span>Amount</span>
          <input
            ref={amountRef}
            className="amount-input"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => { setError(""); setForm((f) => ({ ...f, amount: e.target.value })); }}
          />
        </label>

        <div className="field">
          <span>Category</span>
          <div className="category-grid">
            {categories.map(([name, c]) => (
              <button
                type="button"
                key={name}
                className={`category-chip ${form.category === name ? "active" : ""}`}
                style={{ "--c": c.color }}
                onClick={() => setForm((f) => ({ ...f, category: name }))}
              >
                <span>{c.icon}</span> {name}
              </button>
            ))}
          </div>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Date</span>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </label>
          <label className="field">
            <span>Note</span>
            <input placeholder="Optional" maxLength={80} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          </label>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <footer className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">{initial?.id ? "Save changes" : "Add"}</button>
        </footer>
      </form>
    </div>
  );
}
