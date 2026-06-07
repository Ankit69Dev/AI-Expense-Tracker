"use client";
import { useState } from "react";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const CAT_COLORS: Record<string, string> = {
  "Food & Dining": "#f97316", Transport: "#3b82f6", Shopping: "#8b5cf6",
  Entertainment: "#ec4899", Health: "#22c55e", Utilities: "#f59e0b",
  Rent: "#ef4444", Education: "#06b6d4", Travel: "#14b8a6", Other: "#9ca3af",
};
const monthName = (ym: string) => {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "long", year: "numeric" });
};

interface Report { month: string; total: number; count: number; categories: Record<string, number>; }

export default function ReportsClient({ reports, totalAll }: { reports: Report[]; totalAll: number }) {
  const [expanded, setExpanded]       = useState<string | null>(reports[0]?.month ?? null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [dlAll, setDlAll]             = useState(false);

  /* ── Download one month as PDF-style HTML → print ─────────── */
  const downloadStatement = (report: Report) => {
    setDownloading(report.month);
    const cats   = Object.entries(report.categories).sort((a, b) => b[1] - a[1]);
    const html   = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>SpendWise Statement – ${monthName(report.month)}</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 680px; margin: 40px auto; color: #111; padding: 0 20px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f97316; padding-bottom: 16px; margin-bottom: 24px; }
    .brand  { font-size: 22px; font-weight: 800; color: #f97316; }
    .title  { font-size: 14px; color: #6b7280; margin-top: 4px; }
    .meta   { text-align: right; font-size: 12px; color: #9ca3af; }
    .summary { background: #fff7f3; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .stat-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: .05em; }
    .stat-value { font-size: 22px; font-weight: 700; color: #111; margin-top: 4px; }
    h3 { font-size: 13px; font-weight: 600; color: #374151; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: .05em; }
    .cat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .cat-name { display: flex; align-items: center; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .cat-amount { font-weight: 600; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">💰 SpendWise AI</div>
      <div class="title">Monthly Expense Statement</div>
    </div>
    <div class="meta">
      <div>${monthName(report.month)}</div>
      <div>Generated ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
    </div>
  </div>
  <div class="summary">
    <div><div class="stat-label">Total Spent</div><div class="stat-value">${fmt(report.total)}</div></div>
    <div><div class="stat-label">Transactions</div><div class="stat-value">${report.count}</div></div>
    <div><div class="stat-label">Avg / Transaction</div><div class="stat-value">${fmt(report.total / report.count)}</div></div>
  </div>
  <h3>Category Breakdown</h3>
  ${cats.map(([cat, amt]) => `
    <div class="cat-row">
      <div class="cat-name">
        <span class="dot" style="background:${CAT_COLORS[cat] ?? "#9ca3af"}"></span>
        ${cat}
      </div>
      <div>
        <span class="cat-amount">${fmt(amt)}</span>
        <span style="color:#9ca3af;font-size:11px;margin-left:8px">${((amt / report.total) * 100).toFixed(1)}%</span>
      </div>
    </div>
  `).join("")}
  <div class="footer">SpendWise AI · Expense Intelligence · This is an auto-generated statement</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); win.print(); }
    setDownloading(null);
  };

  /* ── Download ALL months as CSV ────────────────────────────── */
  const downloadAllCSV = async () => {
    setDlAll(true);
    try {
      const res = await fetch("/api/expenses");
      const { expenses } = await res.json();
      const rows = [
        ["Title", "Amount (₹)", "Category", "Date", "Note"],
        ...expenses.map((e: any) => [e.title, e.amount, e.category, e.date, e.note ?? ""]),
      ];
      const csv  = rows.map((r: any[]) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `spendwise-all-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDlAll(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">📄 Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {reports.length} monthly reports · All-time total: {fmt(totalAll)}
          </p>
        </div>
        <button
          onClick={downloadAllCSV}
          disabled={dlAll}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 hover:text-orange-600 text-sm font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-60"
        >
          {dlAll ? <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-orange-500 animate-spin" /> : "⬇"}
          Export All CSV
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-gray-900 font-semibold mb-1">No reports yet</p>
          <p className="text-gray-400 text-sm">Add expenses to generate monthly reports</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r, i) => {
            const isOpen = expanded === r.month;
            const cats   = Object.entries(r.categories).sort((a, b) => b[1] - a[1]);
            const maxCat = Math.max(...cats.map((c) => c[1]), 1);
            const prev   = reports[i + 1];
            const change = prev ? ((r.total - prev.total) / prev.total * 100).toFixed(1) : null;

            return (
              <div key={r.month} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* accordion header */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : r.month)}
                    className="flex-1 flex items-center justify-between hover:opacity-80 transition-opacity cursor-pointer text-left"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{monthName(r.month)}</p>
                      <p className="text-[12px] text-gray-400">{r.count} transactions</p>
                    </div>
                    <div className="flex items-center gap-3 mr-3">
                      {change && (
                        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${Number(change) > 0 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                          {Number(change) > 0 ? "+" : ""}{change}%
                        </span>
                      )}
                      <p className="text-lg font-bold text-gray-900">{fmt(r.total)}</p>
                      <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▾</span>
                    </div>
                  </button>

                  {/* download statement button */}
                  <button
                    onClick={() => downloadStatement(r)}
                    disabled={downloading === r.month}
                    title={`Download ${monthName(r.month)} statement`}
                    className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    {downloading === r.month
                      ? <span className="w-3 h-3 rounded-full border-2 border-orange-300 border-t-orange-600 animate-spin" />
                      : "⬇"}
                    Statement
                  </button>
                </div>

                {/* expanded detail */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    {/* summary row */}
                    <div className="grid grid-cols-3 gap-4 py-4 mb-2">
                      {[
                        { label: "Total Spent",       value: fmt(r.total) },
                        { label: "Transactions",      value: String(r.count) },
                        { label: "Avg / Transaction", value: fmt(r.total / r.count) },
                      ].map((s) => (
                        <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">{s.label}</p>
                          <p className="text-base font-bold text-gray-900 mt-0.5">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* category bars */}
                    <div className="space-y-3">
                      {cats.map(([cat, total]) => (
                        <div key={cat}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-gray-700 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ background: CAT_COLORS[cat] ?? "#9ca3af" }} />
                              {cat}
                            </span>
                            <span className="text-xs font-semibold text-gray-900">
                              {fmt(total)}{" "}
                              <span className="text-gray-400 font-normal">({((total / r.total) * 100).toFixed(0)}%)</span>
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${(total / maxCat) * 100}%`, background: CAT_COLORS[cat] ?? "#9ca3af" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}