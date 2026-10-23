export const EXPENSE_CATEGORIES = {
  Food: { icon: "🍔", color: "#f97316" },
  Transport: { icon: "🚌", color: "#0ea5e9" },
  Shopping: { icon: "🛍️", color: "#ec4899" },
  Bills: { icon: "💡", color: "#eab308" },
  Entertainment: { icon: "🎬", color: "#8b5cf6" },
  Health: { icon: "💊", color: "#14b8a6" },
  Education: { icon: "📚", color: "#6366f1" },
  Other: { icon: "📦", color: "#94a3b8" },
};

export const INCOME_CATEGORIES = {
  Salary: { icon: "💼", color: "#22c55e" },
  Freelance: { icon: "💻", color: "#10b981" },
  Gift: { icon: "🎁", color: "#84cc16" },
  "Other income": { icon: "💰", color: "#65a30d" },
};

export const categoriesFor = (type) => (type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES);

export const categoryInfo = (type, name) =>
  categoriesFor(type)[name] ?? { icon: "❔", color: "#94a3b8" };

export const CURRENCIES = ["USD", "EUR", "GBP", "DZD", "MAD", "SAR", "AED", "CAD", "INR"];

export const DEFAULT_BUDGETS = {
  Food: 400,
  Transport: 120,
  Shopping: 250,
  Bills: 800,
  Entertainment: 100,
};

export const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const pad = (n) => String(n).padStart(2, "0");
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

export const shiftMonth = (key, delta) => {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
};

export const monthLabel = (key, style = "long") => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: style, year: "numeric" });
};

// Small seeded random generator so the demo data is the same on every first load
function seeded(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Six months of realistic example transactions ending today
export function demoTransactions() {
  const rand = seeded(42);
  const today = new Date();
  const list = [];
  const add = (date, type, category, amount, note) =>
    list.push({ id: newId(), type, category, amount: Math.round(amount * 100) / 100, date: isoDate(date), note });

  const templates = [
    ["Food", 8, 45, ["Groceries", "Lunch with friends", "Coffee", "Pizza night", "Bakery"]],
    ["Transport", 3, 30, ["Bus pass", "Taxi", "Fuel"]],
    ["Shopping", 15, 90, ["New shoes", "T-shirt", "Headphones", "Books"]],
    ["Entertainment", 6, 25, ["Cinema", "Concert ticket", "Game"]],
    ["Health", 10, 40, ["Pharmacy", "Gym"]],
  ];

  for (let back = 5; back >= 0; back--) {
    const first = new Date(today.getFullYear(), today.getMonth() - back, 1);
    const lastDay = back === 0 ? today.getDate() : new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const day = (n) => new Date(first.getFullYear(), first.getMonth(), Math.min(n, lastDay));

    add(day(1), "income", "Salary", 2400, "Monthly salary");
    if (rand() > 0.4) add(day(12 + Math.floor(rand() * 10)), "income", "Freelance", 200 + rand() * 500, "Website project");
    add(day(3), "expense", "Bills", 650, "Rent share");
    add(day(5), "expense", "Bills", 40 + rand() * 30, "Electricity");
    add(day(6), "expense", "Bills", 25, "Internet");
    add(day(8), "expense", "Education", 15, "Online course");

    for (const [category, min, max, notes] of templates) {
      const count = category === "Food" ? 9 : 1 + Math.floor(rand() * 3);
      for (let i = 0; i < count; i++) {
        add(day(1 + Math.floor(rand() * lastDay)), "expense", category, min + rand() * (max - min), notes[Math.floor(rand() * notes.length)]);
      }
    }
  }
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
}
