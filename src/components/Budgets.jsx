import { useState } from "react";
import { EXPENSE_CATEGORIES } from "../data.js";

export default function Budgets({ budgets, spent, format, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(budgets);

  const rows = Object.entries(EXPENSE_CATEGORIES).filter(([name]) => budgets[name] > 0);

  const save = () => {
    const clean = {};
    for (const [name, value] of Object.entries(draft)) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) clean[name] = Math.round(n);
    }
    onChange(clean);
    setEditing(false);
  };

  return (
    <div className="card">
      <div className="card-head">
        <h3>Monthly budgets</h3>
        {editing ? (
          <div className="row-gap">
            <button className="btn ghost sm" onClick={() => { setDraft(budgets); setEditing(false); }}>Cancel</button>
            <button className="btn primary sm" onClick={save}>Save</button>
          </div>
        ) : (
          <button className="btn ghost sm" onClick={() => { setDraft(budgets); setEditing(true); }}>Edit</button>
        )}
      </div>

      {editing ? (
        <div className="budget-edit">
          {Object.entries(EXPENSE_CATEGORIES).map(([name, c]) => (
            <label key={name} className="budget-edit-row">
              <span>{c.icon} {name}</span>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="No limit"
                value={draft[name] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [name]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="muted">No budgets yet. Click Edit to set a monthly limit per category.</p>
      ) : (
        <ul className="budgets">
          {rows.map(([name, c]) => {
            const limit = budgets[name];
            const used = spent[name] ?? 0;
            const pct = Math.min(100, (used / limit) * 100);
            const state = used > limit ? "over" : pct >= 80 ? "warn" : "ok";
            return (
              <li key={name}>
                <div className="budget-top">
                  <span>{c.icon} {name}</span>
                  <span className={`budget-num ${state}`}>{format(used)} <span className="muted">/ {format(limit)}</span></span>
                </div>
                <div className="meter"><span className={state} style={{ width: `${pct}%`, "--c": c.color }} /></div>
                <span className={`budget-note ${state}`}>
                  {state === "over" ? `${format(used - limit)} over budget` : `${format(limit - used)} left`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
