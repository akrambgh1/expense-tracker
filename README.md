# 💸 Spendly — Expense Tracker

Spendly is a clean personal finance dashboard. Track income and expenses, set monthly budgets per category, and see where your money goes with interactive charts.

Built with **React**, **Chart.js** and **Vite**. Everything is saved in your browser, so there's no account and no server.

**🔗 Live demo:** https://akrambgh1.github.io/expense-tracker/

## ✨ Features

- ➕ **Add, edit and delete** income and expenses (amount, category, date, note), with **undo** after deleting
- 🗓️ **Month navigation** to look back at any month
- 📊 **Dashboard cards**: total balance, monthly income, expenses (with % change vs last month) and amount saved (savings rate)
- 🍩 **Doughnut chart** of spending by category, with amounts and percentages
- 📈 **Bar chart** comparing income and expenses over the last 6 months
- 🎯 **Monthly budgets** per category, with progress bars that turn orange at 80% and red when you go over
- 🔍 **Search and filter** by type and category
- 💱 **9 currencies** (USD, EUR, GBP, DZD, MAD, SAR, AED, CAD, INR), formatted with `Intl.NumberFormat`
- ⬇️ **Export to CSV** to open in Excel or Google Sheets
- 🌙 **Dark mode**, and a **mobile layout** with a floating add button
- 🎲 Realistic **demo data** (6 months) so the charts look full on first load

## 🛠️ Tech Stack

| Part | Technology |
|------|------------|
| UI | React 18 (hooks) |
| Charts | Chart.js 4 + react-chartjs-2 |
| Build tool | Vite |
| Styling | Plain CSS with custom properties (light and dark themes) |
| Storage | `localStorage` with a custom `useLocalStorage` hook |
| CI/CD | GitHub Actions to GitHub Pages |

## 🚀 Run Locally

```bash
git clone https://github.com/akrambgh1/expense-tracker.git
cd expense-tracker
npm install
npm run dev
```

Then open http://localhost:5173/expense-tracker/

## 📂 Project Structure

```
src/
├── App.jsx                     # State, monthly calculations, layout
├── data.js                     # Categories, currencies, date helpers, demo data
├── useLocalStorage.js          # Persisted state hook
├── styles.css
└── components/
    ├── Charts.jsx              # Doughnut + bar charts (theme-aware)
    ├── Budgets.jsx             # Budget progress and editor
    ├── TransactionForm.jsx     # Add and edit modal with validation
    └── TransactionList.jsx     # List grouped by day
```

## 📚 What I Learned

- Deriving dashboard numbers from raw data with `useMemo`
- Building charts with Chart.js and making them follow the light or dark theme
- Formatting money for different currencies with the `Intl` API
- Form validation and accessible modals
- Generating repeatable demo data with a seeded random generator
- Exporting data as a CSV file in the browser

## 📄 License

MIT. Free to use and modify.
