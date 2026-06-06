"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface User { name: string; email: string; image: string | null; }

const nav = [
  { href: "/dashboard",              emoji: "🏠", label: "Dashboard"    },
  { href: "/dashboard/transaction", emoji: "💳", label: "Transactions" },
  { href: "/dashboard/analytic",    emoji: "📊", label: "Analytics"    },
  { href: "/dashboard/goal",        emoji: "🎯", label: "Goals"        },
  { href: "/dashboard/investment",  emoji: "💰", label: "Investments"  },
  { href: "/dashboard/ai",           emoji: "🤖", label: "AI Assistant" },
  { href: "/dashboard/reports",      emoji: "📄", label: "Reports"      },
  { href: "/dashboard/setting",     emoji: "⚙️",  label: "Settings"    },
];

const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const Logo = () => (
  <svg width="30" height="30" viewBox="0 0 38 38" fill="none">
    <rect width="38" height="38" rx="11" fill="#f97316"/>
    <circle cx="19" cy="19" r="9" stroke="white" strokeWidth="1.8" strokeOpacity="0.35"/>
    <path d="M19 13v1.5M19 24.5V26M14 19h-1.5M26 19h-1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="19" cy="19" r="3.5" fill="white"/>
  </svg>
);

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}>
            <span className="text-lg w-6 text-center leading-none">{item.emoji}</span>
            <span>{item.label}</span>
            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500"/>}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarInner = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <Logo/>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">SpendWise AI</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Expense Intelligence</p>
        </div>
      </div>
      <NavLinks/>
      <div className="px-3 pb-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50">
          {user.image
            ? <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-100 shrink-0"/>
            : <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials(user.name)}</div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-[10.5px] text-gray-400 truncate">{user.email}</p>
          </div>
          <button onClick={() => setConfirmSignOut(true)} title="Sign out"
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0 text-sm">⏻</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* desktop */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 h-screen sticky top-0 z-20">
        <SidebarInner/>
      </aside>

      {/* mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2"><Logo/><span className="font-bold text-sm text-gray-900">SpendWise AI</span></div>
        <button onClick={() => setMobileOpen(true)} className="text-2xl cursor-pointer">☰</button>
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}/>
          <div className="relative w-64 bg-white h-full shadow-xl"><SidebarInner/></div>
        </div>
      )}

      {/* sign out confirm */}
      {confirmSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-xl shrink-0">👋</div>
              <h3 className="font-bold text-gray-900">Sign out?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6 pl-[52px]">You'll be returned to the login page.</p>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setConfirmSignOut(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer">Cancel</button>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gray-800 hover:bg-gray-900 cursor-pointer">Sign out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}