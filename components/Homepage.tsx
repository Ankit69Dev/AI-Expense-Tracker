import type { Metadata } from "next";
import GoogleSignInButton from "@/components/SignIn";

/* ─── SVG icons (inline, no extra deps) ────────────────────── */

const SpendWiseIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
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
    <path
      d="M18 15.5v1.2l-1.2 1.3 1.2 1.3v1.2"
      stroke="#FF6B2B"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BrainIcon = () => (
  <svg width="54" height="54" viewBox="0 0 56 56" fill="none" aria-hidden="true">
    <circle cx="28" cy="28" r="28" fill="white" fillOpacity="0.1" />
    <path d="M22 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M16 26c0-2.21 1.79-4 4-4h16c2.21 0 4 1.79 4 4v6c0 4.418-3.582 8-8 8h-8c-4.418 0-8-3.582-8-8v-6z"
      stroke="white"
      strokeWidth="2"
    />
    <path d="M22 28h12M22 32h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="20" cy="26" r="2" fill="white" fillOpacity="0.55" />
    <circle cx="36" cy="26" r="2" fill="white" fillOpacity="0.55" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M3 15l5-5 4 3 7-8" stroke="#FF6B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 5h4v4" stroke="#FF6B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path
      d="M11 2L4 5v5c0 4.418 2.985 8.556 7 10 4.015-1.444 7-5.582 7-10V5L11 2z"
      stroke="#FF6B2B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 11l2 2 4-4" stroke="#FF6B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M11 2v4M11 16v4M2 11h4M16 11h4" stroke="#FF6B2B" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M4.929 4.929l2.828 2.828M14.243 14.243l2.828 2.828M4.929 17.071l2.828-2.828M14.243 7.757l2.828-2.828"
      stroke="#FF6B2B"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="11" cy="11" r="2.5" fill="#FF6B2B" />
  </svg>
);

/* ─── Static data ───────────────────────────────────────────── */

const features = [
  {
    icon: <SparkleIcon />,
    title: "AI-Powered Insights",
    desc: "Smart categorization and spending predictions powered by machine learning.",
  },
  {
    icon: <ChartIcon />,
    title: "Real-Time Analytics",
    desc: "Visual dashboards that update instantly as you spend.",
  },
  {
    icon: <ShieldIcon />,
    title: "Bank-Level Security",
    desc: "256-bit encryption and zero-knowledge architecture keeps your data safe.",
  },
];

const stats = [
  { value: "2.4M+", label: "Transactions analyzed" },
  { value: "₹840Cr", label: "Savings found" },
  { value: "98%", label: "Accuracy rate" },
];

/* ─── Metadata ──────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Sign In — SpendWise AI",
  description: "AI-powered expense tracking and financial insights.",
};

/* ─── Page (Server Component) ───────────────────────────────── */

export default function LoginPage() {
  return (
    <div className="login-root">

      {/* ── LEFT PANEL ──────────────────────────────────────── */}
      <aside className="login-left" aria-label="Product overview">
        {/* Decorative blobs */}
        <div className="left-blob left-blob-1" aria-hidden="true" />
        <div className="left-blob left-blob-2" aria-hidden="true" />
        <div className="left-blob left-blob-3" aria-hidden="true" />

        {/* Brand */}
        <div className="left-brand">
          <SpendWiseIcon />
          <div>
            <div className="left-brand-name">SpendWise AI</div>
            <div className="left-brand-tagline">Expense Intelligence</div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="left-hero">
          <div className="left-hero-icon">
            <BrainIcon />
          </div>
          <h1 className="left-heading">
            Your money,<br />
            <span>finally</span> understood.
          </h1>
          <p className="left-subtext">
            AI that learns your spending habits, flags unusual charges, and
            tells you exactly where to cut back — automatically.
          </p>
        </div>

        {/* Features */}
        <div className="left-features">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon-box">{f.icon}</div>
              <div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="left-stats">
          {stats.map((s) => (
            <div className="stat-pill" key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── RIGHT PANEL ─────────────────────────────────────── */}
      <main className="login-right">
        <div className="auth-card" role="main">

          {/* Card brand */}
          <div className="auth-card-brand">
            <SpendWiseIcon />
            <span className="auth-card-brand-name">SpendWise AI</span>
          </div>

          {/* Heading */}
          <h2 className="auth-heading">Welcome back</h2>
          <p className="auth-subtext">
            Sign in to your account to continue tracking your expenses.
          </p>

          {/* ── Google sign-in (Client Component) ── */}
          <GoogleSignInButton callbackUrl="/dashboard" />

          {/* Divider */}
          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">Secure sign-in via Google OAuth</span>
            <div className="auth-divider-line" />
          </div>

          {/* Trust badges */}
          <div className="trust-row">
            <span className="trust-badge">
              <span className="trust-dot" aria-hidden="true" />
              256-bit SSL
            </span>
            <span className="trust-badge">
              <span className="trust-dot" aria-hidden="true" />
              SOC 2 certified
            </span>
            <span className="trust-badge">
              <span className="trust-dot" aria-hidden="true" />
              No card required
            </span>
          </div>

          {/* Legal */}
          <p className="auth-legal">
            By signing in you agree to our{" "}
            <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </main>

    </div>
  );
}