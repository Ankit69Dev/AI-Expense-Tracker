"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────────────── */
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "savings";
  category: string;
  date: string;
}

/* ─── Custom Inline SVG Icons (Orange/White theme compatible) ─ */

const AppLogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <rect width="36" height="36" rx="10" fill="#FF6B2B" />
    <path
      d="M18 8C12.477 8 8 12.477 8 18s4.477 10 10 10 10-4.477 10-10S23.523 8 18 8z"
      fill="white"
      fillOpacity="0.2"
    />
    <path
      d="M18 11v2M18 23v2M13 18h-2M25 18h-2"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="18" cy="18" r="4" fill="white" />
  </svg>
);

const BalanceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const IncomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);

const ExpenseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const SavingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    <line x1="12" y1="11" x2="12" y2="17"></line>
    <line x1="9" y1="14" x2="15" y2="14"></line>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const LightbulbIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21h6"></path>
    <path d="M9 17h6"></path>
    <path d="M10 3h4a6 6 0 0 1 6 6v1a4 4 0 0 1-2 3.5v1.5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.5A4 4 0 0 1 4 10V9a6 6 0 0 1 6-6z"></path>
  </svg>
);

/* ─── Initial Mock Data ─────────────────────────────────────── */
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "1", description: "Monthly Salary", amount: 95000, type: "income", category: "Salary", date: "2026-06-01" },
  { id: "2", description: "Apartment Rent", amount: 25000, type: "expense", category: "Rent", date: "2026-06-01" },
  { id: "3", description: "Mutual Fund SIP", amount: 10000, type: "savings", category: "Retirement", date: "2026-06-02" },
  { id: "4", description: "Organic Groceries", amount: 4800, type: "expense", category: "Food", date: "2026-06-02" },
  { id: "5", description: "Freelance Project Payment", amount: 18000, type: "income", category: "Freelance", date: "2026-06-03" },
  { id: "6", description: "High-speed Internet", amount: 1200, type: "expense", category: "Utilities", date: "2026-06-03" },
  { id: "7", description: "Specialty Coffee Roast", amount: 450, type: "expense", category: "Food", date: "2026-06-03" },
  { id: "8", description: "Gold ETF Investment", amount: 5000, type: "savings", category: "General Savings", date: "2026-06-03" },
];

const CATEGORIES_BY_TYPE = {
  income: ["Salary", "Freelance", "Investment Return", "Others"],
  expense: ["Food", "Rent", "Utilities", "Entertainment", "Travel", "Others"],
  savings: ["General Savings", "Emergency Fund", "Retirement", "Stocks/Crypto"],
};

export default function Dashboard() {
  const router = useRouter();

  /* ─── Component State ──────────────────────────────────────── */
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense" | "savings">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Transaction Form State
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formType, setFormType] = useState<"income" | "expense" | "savings">("expense");
  const [formCategory, setFormCategory] = useState(CATEGORIES_BY_TYPE.expense[0]);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);

  /* ─── Financial Calculations ────────────────────────────────── */
  const { totalIncome, totalExpenses, totalSavings, currentBalance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let sav = 0;

    transactions.forEach((tx) => {
      if (tx.type === "income") inc += tx.amount;
      else if (tx.type === "expense") exp += tx.amount;
      else if (tx.type === "savings") sav += tx.amount;
    });

    return {
      totalIncome: inc,
      totalExpenses: exp,
      totalSavings: sav,
      // Current Balance = Income - Expenses
      currentBalance: inc - exp,
    };
  }, [transactions]);

  /* ─── Filters & Search Logic ────────────────────────────────── */
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesTab = activeTab === "all" || tx.type === activeTab;
        const matchesSearch =
          tx.description.toLowerCase().includes(search.toLowerCase()) ||
          tx.category.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, activeTab, search]);

  /* ─── AI Insights Logic ─────────────────────────────────────── */
  const aiInsights = useMemo(() => {
    const insights = [];
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    // Savings insights
    if (savingsRate === 0) {
      insights.push({
        type: "warning",
        title: "No Savings Configured",
        desc: "You haven't allocated any funds to savings transactions yet. Try setting aside 10-15% of your Freelance or Salary.",
      });
    } else if (savingsRate < 12) {
      insights.push({
        type: "warning",
        title: "Boost Your Savings",
        desc: `Your savings rate is at ${savingsRate.toFixed(1)}%. We recommend pushing it closer to 15% to accelerate your wealth targets.`,
      });
    } else {
      insights.push({
        type: "success",
        title: "Excellent Savings Pace!",
        desc: `Superb! You are saving ${savingsRate.toFixed(1)}% of your earnings. Keep up this consistency to hitting your long-term goals.`,
      });
    }

    // Expense ratio insights
    if (totalExpenses > totalIncome && totalIncome > 0) {
      insights.push({
        type: "warning",
        title: "Deficit Spending Alert",
        desc: "Your expenses exceed your total income this month. Review non-essential expenses like food delivery or entertainment.",
      });
    } else if (expenseRatio > 70) {
      insights.push({
        type: "warning",
        title: "High Budget Utilisation",
        desc: `You are spending ${expenseRatio.toFixed(1)}% of your income. Rent and Food are eating up the majority of your cash flow.`,
      });
    } else if (expenseRatio > 0 && expenseRatio <= 40) {
      insights.push({
        type: "success",
        title: "Healthy Expense Buffer",
        desc: `Expenses are extremely low, standing at just ${expenseRatio.toFixed(1)}% of total income. You have healthy capital headroom.`,
      });
    }

    // Category balance insights
    const rentTx = transactions.find((t) => t.category === "Rent");
    if (rentTx && totalIncome > 0) {
      const rentRatio = (rentTx.amount / totalIncome) * 100;
      if (rentRatio > 35) {
        insights.push({
          type: "warning",
          title: "Rent-to-Income Overhead",
          desc: `Rent makes up ${rentRatio.toFixed(1)}% of your total income. It's recommended to keep housing costs under 30% of income.`,
        });
      }
    }

    return insights;
  }, [transactions, totalIncome, totalExpenses, totalSavings]);

  /* ─── Custom Dynamic Chart Calculations ─────────────────────── */

  // 1. Expense Breakdown Donut Data
  const donutData = useMemo(() => {
    const grouped: Record<string, number> = {};
    transactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount;
      });

    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);

    const categories = Object.keys(grouped);
    let accumulatedAngle = 0;

    return categories.map((cat, idx) => {
      const amount = grouped[cat];
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      const angle = (percentage / 100) * 360;

      // Color scheme for categories (orange/white theme compatible)
      const colors = ["#FF6B2B", "#FF925C", "#FFAF87", "#FFD2BA", "#FFF3EB", "#D97706"];
      const color = colors[idx % colors.length];

      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      return {
        category: cat,
        amount,
        percentage,
        color,
        startAngle,
        angle,
      };
    });
  }, [transactions]);

  // Donut SVG path builder
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // 2. Trend Area Chart Data (Last 5 Days cumulative)
  const areaChartPoints = useMemo(() => {
    // Generate the last 5 days
    const days = Array.from({ length: 5 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (4 - i));
      return d.toISOString().split("T")[0];
    });

    let cumulativeInc = 0;
    let cumulativeExp = 0;

    // Precalculate before these days
    transactions.forEach((tx) => {
      if (tx.date < days[0]) {
        if (tx.type === "income") cumulativeInc += tx.amount;
        if (tx.type === "expense") cumulativeExp += tx.amount;
      }
    });

    const incomeTrend: number[] = [];
    const expenseTrend: number[] = [];

    days.forEach((day) => {
      const dailyTxs = transactions.filter((tx) => tx.date === day);
      dailyTxs.forEach((tx) => {
        if (tx.type === "income") cumulativeInc += tx.amount;
        if (tx.type === "expense") cumulativeExp += tx.amount;
      });
      incomeTrend.push(cumulativeInc);
      expenseTrend.push(cumulativeExp);
    });

    const maxVal = Math.max(...incomeTrend, ...expenseTrend, 10000) * 1.1;

    // Map trends to SVG points (viewBox 0 0 500 160)
    const paddingLeft = 40;
    const paddingRight = 10;
    const width = 500 - paddingLeft - paddingRight;
    const height = 140;
    const stepX = width / 4;

    const mapY = (val: number) => height - (val / maxVal) * height + 10;

    const incPoints = incomeTrend.map((val, idx) => ({
      x: paddingLeft + idx * stepX,
      y: mapY(val),
    }));

    const expPoints = expenseTrend.map((val, idx) => ({
      x: paddingLeft + idx * stepX,
      y: mapY(val),
    }));

    return {
      days,
      incPoints,
      expPoints,
      maxVal,
      incomeTrend,
      expenseTrend,
    };
  }, [transactions]);

  /* ─── Actions ───────────────────────────────────────────────── */
  const handleAddTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim() || !formAmount || parseFloat(formAmount) <= 0) {
      alert("Please fill in a valid description and positive amount.");
      return;
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      description: formDescription.trim(),
      amount: parseFloat(formAmount),
      type: formType,
      category: formCategory,
      date: formDate,
    };

    setTransactions((prev) => [...prev, newTx]);
    setIsModalOpen(false);

    // Reset Form
    setFormDescription("");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
  };

  const handleTypeChangeInForm = (type: "income" | "expense" | "savings") => {
    setFormType(type);
    setFormCategory(CATEGORIES_BY_TYPE[type][0]);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    }
  };

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="dashboard-root">
      {/* ─── SIDEBAR NAVIGATION ───────────────────────────────────── */}
      <aside className="dashboard-sidebar" aria-label="Sidebar navigation">
        <div>
          <div className="sidebar-logo">
            <AppLogoIcon />
            <span className="sidebar-logo-name">SpendWise AI</span>
          </div>

          <nav className="sidebar-menu">
            <Link href="/dashboard" className="menu-item active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Overview
            </Link>
            <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              Transactions
            </a>
            <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Budgets
            </a>
            <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              AI Insights
            </a>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar" aria-hidden="true">
              JD
            </div>
            <div className="user-info">
              <div className="user-name">Jane Doe</div>
              <div className="user-email">jane.doe@gmail.com</div>
            </div>
            <button className="btn-logout" onClick={handleLogout} aria-label="Sign out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN DASHBOARD CONTENT ───────────────────────────────── */}
      <main className="dashboard-main" role="main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Financial Dashboard</h1>
            <p>Welcome back, Jane. SpendWise AI has updated your metrics.</p>
          </div>
          <button className="btn-add" onClick={() => setIsModalOpen(true)}>
            <PlusIcon /> Add Transaction
          </button>
        </header>

        {/* ─── KPI METRIC GRID ─── */}
        <section className="kpi-grid" aria-label="Key financial metrics">
          {/* Current Balance */}
          <div className="kpi-card balance-card">
            <div className="kpi-icon-box icon-balance">
              <BalanceIcon />
            </div>
            <h2 className="kpi-label">Current Balance</h2>
            <div className="kpi-value">₹{currentBalance.toLocaleString("en-IN")}</div>
            <div className="kpi-subtext">
              <span>Income − Expenses</span>
            </div>
          </div>

          {/* Total Income */}
          <div className="kpi-card">
            <div className="kpi-icon-box icon-income">
              <IncomeIcon />
            </div>
            <h2 className="kpi-label">Total Income</h2>
            <div className="kpi-value">₹{totalIncome.toLocaleString("en-IN")}</div>
            <div className="kpi-subtext positive">
              <span>▲ Cash inflow active</span>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="kpi-card">
            <div className="kpi-icon-box icon-expense">
              <ExpenseIcon />
            </div>
            <h2 className="kpi-label">Total Expenses</h2>
            <div className="kpi-value">₹{totalExpenses.toLocaleString("en-IN")}</div>
            <div className="kpi-subtext negative">
              <span>▼ Cash outflow active</span>
            </div>
          </div>

          {/* Total Savings */}
          <div className="kpi-card">
            <div className="kpi-icon-box icon-savings">
              <SavingsIcon />
            </div>
            <h2 className="kpi-label">Total Savings</h2>
            <div className="kpi-value">₹{totalSavings.toLocaleString("en-IN")}</div>
            <div className="kpi-subtext">
              <span style={{ color: "#3B82F6" }}>🛡️ Budget security fund</span>
            </div>
          </div>
        </section>

        {/* ─── ANALYTICS AND INSIGHTS GRID ─── */}
        <section className="analytics-grid" aria-label="Visualizations and AI suggestions">
          {/* Custom SVG Trend Chart */}
          <div className="analytics-card">
            <div className="card-header">
              <h2>Income & Expense Trend</h2>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color color-income" /> Income
                </span>
                <span className="legend-item">
                  <span className="legend-color color-expense" /> Expenses
                </span>
              </div>
            </div>

            <div className="chart-container">
              <svg width="100%" height="100%" viewBox="0 0 500 160" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                {/* Horizontal Gridlines */}
                <line x1="40" y1="10" x2="490" y2="10" stroke="#F3F4F6" strokeWidth="1.5" />
                <line x1="40" y1="80" x2="490" y2="80" stroke="#F3F4F6" strokeWidth="1.5" />
                <line x1="40" y1="150" x2="490" y2="150" stroke="#F3F4F6" strokeWidth="1.5" />

                {/* Y-Axis Value Labels */}
                <text x="32" y="14" fill="#9CA3AF" fontSize="10" textAnchor="end">
                  ₹{(areaChartPoints.maxVal / 1000).toFixed(0)}k
                </text>
                <text x="32" y="84" fill="#9CA3AF" fontSize="10" textAnchor="end">
                  ₹{(areaChartPoints.maxVal / 2000).toFixed(0)}k
                </text>
                <text x="32" y="154" fill="#9CA3AF" fontSize="10" textAnchor="end">
                  ₹0
                </text>

                {/* Income Area & Line */}
                {areaChartPoints.incPoints.length > 1 && (
                  <>
                    <path
                      d={`M ${areaChartPoints.incPoints[0].x} 150 ${areaChartPoints.incPoints
                        .map((p) => `L ${p.x} ${p.y}`)
                        .join(" ")} L ${areaChartPoints.incPoints[areaChartPoints.incPoints.length - 1].x} 150 Z`}
                      fill="url(#incomeGrad)"
                      opacity="0.15"
                    />
                    <path
                      d={areaChartPoints.incPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {areaChartPoints.incPoints.map((p, i) => (
                      <circle key={`inc-dot-${i}`} cx={p.x} cy={p.y} r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                    ))}
                  </>
                )}

                {/* Expense Area & Line */}
                {areaChartPoints.expPoints.length > 1 && (
                  <>
                    <path
                      d={`M ${areaChartPoints.expPoints[0].x} 150 ${areaChartPoints.expPoints
                        .map((p) => `L ${p.x} ${p.y}`)
                        .join(" ")} L ${areaChartPoints.expPoints[areaChartPoints.expPoints.length - 1].x} 150 Z`}
                      fill="url(#expenseGrad)"
                      opacity="0.15"
                    />
                    <path
                      d={areaChartPoints.expPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                      fill="none"
                      stroke="#FF6B2B"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {areaChartPoints.expPoints.map((p, i) => (
                      <circle key={`exp-dot-${i}`} cx={p.x} cy={p.y} r="4.5" fill="#FF6B2B" stroke="#FFFFFF" strokeWidth="1.5" />
                    ))}
                  </>
                )}

                {/* X-Axis labels */}
                {areaChartPoints.days.map((day, idx) => {
                  const x = 40 + idx * ((500 - 50) / 4);
                  // Format 'YYYY-MM-DD' -> 'MM/DD'
                  const formattedDate = day.substring(5).replace("-", "/");
                  return (
                    <text key={`date-${idx}`} x={x} y="172" fill="#9CA3AF" fontSize="10" textAnchor="middle">
                      {formattedDate}
                    </text>
                  );
                })}

                {/* Gradients */}
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B2B" />
                    <stop offset="100%" stopColor="#FF6B2B" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* AI Insights Sidebar */}
          <div className="analytics-card" style={{ gap: "16px" }}>
            <div className="card-header">
              <h2>SpendWise AI Insights</h2>
            </div>
            <div className="insights-list">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className={`insight-item ${insight.type}`}>
                  <div className="insight-icon" aria-hidden="true">
                    <LightbulbIcon />
                  </div>
                  <div className="insight-content">
                    <h3 className="insight-title">{insight.title}</h3>
                    <p className="insight-desc">{insight.desc}</p>
                  </div>
                </div>
              ))}
              {aiInsights.length === 0 && (
                <div className="empty-state" style={{ padding: "20px 0" }}>
                  No active insights. Add transactions to trigger analytics.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── TRANSACTION LEDGER TABLE ─── */}
        <section className="transactions-card" aria-label="Transactions management">
          <div className="transactions-toolbar">
            <div className="toolbar-left">
              <input
                type="text"
                className="search-input"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search transactions"
              />

              <div className="filter-tabs" role="tablist">
                {(["all", "income", "expense", "savings"] as const).map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={`filter-tab ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th scope="col">Description</th>
                  <th scope="col">Type</th>
                  <th scope="col">Category</th>
                  <th scope="col">Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col" style={{ width: "60px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="col-description">{tx.description}</td>
                    <td>
                      <span className={`badge badge-${tx.type}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td>{tx.category}</td>
                    <td className="col-date">{tx.date}</td>
                    <td className={`col-amount amount-${tx.type}`}>
                      {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : ""} ₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteTransaction(tx.id)}
                        aria-label={`Delete ${tx.description}`}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <div className="empty-state-icon" aria-hidden="true">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                          </svg>
                        </div>
                        No transactions match your filters.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ─── ADD TRANSACTION MODAL ────────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <h3 id="modal-title">Add New Transaction</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)} aria-label="Close dialog">
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleAddTransactionSubmit}>
              <div className="form-grid">
                {/* Description */}
                <div className="form-group">
                  <label htmlFor="tx-desc">Description</label>
                  <input
                    id="tx-desc"
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Amazon Kindle Books"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                {/* Type & Amount row */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tx-type">Transaction Type</label>
                    <select
                      id="tx-type"
                      className="form-control"
                      value={formType}
                      onChange={(e) => handleTypeChangeInForm(e.target.value as any)}
                    >
                      <option value="income">Income (+)</option>
                      <option value="expense">Expense (-)</option>
                      <option value="savings">Savings / Goals</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tx-amount">Amount (₹)</label>
                    <input
                      id="tx-amount"
                      type="number"
                      required
                      min="1"
                      step="any"
                      className="form-control"
                      placeholder="e.g. 1250"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category & Date row */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tx-cat">Category</label>
                    <select
                      id="tx-cat"
                      className="form-control"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      {CATEGORIES_BY_TYPE[formType].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tx-date">Date</label>
                    <input
                      id="tx-date"
                      type="date"
                      required
                      className="form-control"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
