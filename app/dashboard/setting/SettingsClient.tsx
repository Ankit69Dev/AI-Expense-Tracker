"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface Props {
  user: { id: string; name: string; email: string; image: string | null; createdAt: string };
  stats: { expenseCount: number; goalCount: number; investmentCount: number };
}

const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function SettingsClient({ user, stats }: Props) {
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const res = await fetch("/api/expenses");
      const { expenses } = await res.json();
      const rows = [
        ["Title", "Amount", "Category", "Date", "Note"],
        ...expenses.map((e: any) => [e.title, e.amount, e.category, e.date, e.note ?? ""]),
      ];
      const csv = rows.map((r) => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `spendwise-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  const Row = ({ label, value, action }: { label: string; value?: string; action?: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {value && <p className="text-xs text-gray-400 mt-0.5">{value}</p>}
      </div>
      {action}
    </div>
  );

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">⚙️ Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl">

        {/* ── Profile ─────────────────────────────────────── */}
        <Section title="Profile">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-orange-100" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-xl font-bold ring-2 ring-orange-100">
                {initials(user.name)}
              </div>
            )}
            <div>
              <p className="text-base font-bold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1">Member since {memberSince}</p>
            </div>
          </div>
          <Row label="Full Name" value={user.name} />
          <Row label="Email Address" value={user.email}
            action={<span className="text-[11px] bg-green-50 text-green-600 font-medium px-2 py-0.5 rounded-full">Verified</span>} />
          <Row label="Sign-in Method" value="Google OAuth"
            action={<span className="text-[11px] bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full">Google</span>} />
          <Row label="Account ID" value={user.id.slice(0, 20) + "…"}
            action={
              <button onClick={handleCopyId} className="text-xs text-orange-500 hover:underline cursor-pointer font-medium">
                {copied ? "✓ Copied" : "Copy"}
              </button>
            } />
        </Section>

        {/* ── Account Stats ────────────────────────────────── */}
        <Section title="Your Data">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Expenses", value: stats.expenseCount, emoji: "💳" },
              { label: "Goals",    value: stats.goalCount,    emoji: "🎯" },
              { label: "Investments", value: stats.investmentCount, emoji: "💰" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">{s.emoji}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Data & Privacy ───────────────────────────────── */}
        <Section title="Data & Privacy">
          <Row
            label="Export Expenses"
            value="Download all your transactions as a CSV file"
            action={
              <button
                onClick={handleExportData}
                disabled={exportLoading}
                className="flex items-center gap-1.5 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
              >
                {exportLoading ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-orange-300 border-t-orange-600 animate-spin" />
                ) : "⬇ Export CSV"}
              </button>
            }
          />
          <Row
            label="Data Storage"
            value="Your data is stored securely in Neon PostgreSQL"
            action={<span className="text-[11px] bg-green-50 text-green-600 font-medium px-2 py-0.5 rounded-full">🔒 Encrypted</span>}
          />
          <Row
            label="AI Data Usage"
            value="Your expenses are sent to Groq AI only when you use the AI Assistant"
            action={<span className="text-[11px] bg-orange-50 text-orange-600 font-medium px-2 py-0.5 rounded-full">On demand</span>}
          />
        </Section>

        {/* ── App Info ─────────────────────────────────────── */}
        <Section title="About">
          <Row label="App Name"    value="SpendWise AI" />
          <Row label="Version"     value="1.0.0" />
          <Row label="Database"    value="Neon PostgreSQL (Serverless)" />
          <Row label="AI Provider" value="Groq · Llama 3.3 70B Versatile" />
          <Row label="Auth"        value="NextAuth v5 · Google OAuth" />
          <Row label="Framework"   value="Next.js 14 · TypeScript · Tailwind CSS" />
        </Section>

        {/* ── Danger Zone ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden mb-5">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50/50">
            <h2 className="text-sm font-semibold text-red-700">⚠️ Danger Zone</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Sign Out</p>
                <p className="text-xs text-gray-400 mt-0.5">Sign out of your SpendWise AI account</p>
              </div>
              <button
                onClick={() => setConfirmSignOut(true)}
                className="text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Delete Account</p>
                <p className="text-xs text-gray-400 mt-0.5">Permanently delete all your data. This cannot be undone.</p>
              </div>
              <button
                onClick={() => setConfirmDeleteAccount(true)}
                className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* sign out confirm */}
      {confirmSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-xl">👋</div>
              <h3 className="font-bold text-gray-900">Sign out?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6 pl-[52px]">You'll be returned to the login page.</p>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setConfirmSignOut(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer">Cancel</button>
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gray-800 hover:bg-gray-900 cursor-pointer">Sign out</button>
            </div>
          </div>
        </div>
      )}

      {/* delete account confirm */}
      {confirmDeleteAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-xl">⚠️</div>
              <h3 className="font-bold text-gray-900">Delete account?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-2 pl-[52px]">This will permanently delete:</p>
            <ul className="text-sm text-gray-500 mb-6 pl-[52px] space-y-1">
              <li>• All your expenses</li>
              <li>• All goals and investments</li>
              <li>• Your account and profile</li>
            </ul>
            <p className="text-xs text-red-500 mb-5 pl-[52px] font-medium">This action cannot be undone.</p>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setConfirmDeleteAccount(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer">Cancel</button>
              <button
                onClick={async () => {
                  await fetch("/api/account", { method: "DELETE" });
                  signOut({ callbackUrl: "/login" });
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 cursor-pointer"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}