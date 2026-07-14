"use client";
import { useState } from "react";

const CAT_COLORS: Record<string, string> = {
  "Food & Dining":"#f97316",Transport:"#3b82f6",Shopping:"#8b5cf6",
  Entertainment:"#ec4899",Health:"#22c55e",Utilities:"#f59e0b",
  Rent:"#ef4444",Education:"#06b6d4",Travel:"#14b8a6",Other:"#9ca3af",
};
const CATEGORIES = ["Food & Dining","Transport","Shopping","Entertainment","Health","Utilities","Rent","Education","Travel","Other"];
const fmt = (n: number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const monthLabel = (ym: string) => { const [y,m]=ym.split("-"); return new Date(Number(y),Number(m)-1).toLocaleString("default",{month:"short"}); };
const initials = (n: string) => n.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();

interface Expense { id:string; title:string; amount:number; category:string; date:string; note:string; }
interface Goal { id:string; title:string; emoji:string; targetAmount:number; currentAmount:number; deadline:string|null; }
interface Props {
  user: { id:string; name:string; email:string; image:string|null };
  stats: { totalThisMonth:number; totalLastMonth:number; categories:{category:string;total:number}[]; monthly:{month:string;total:number}[]; totalCount:number; totalInvested:number; totalInvestmentValue:number };
  initialExpenses: Expense[];
  initialGoals: Goal[];
}

export default function DashboardHome({ user, stats, initialExpenses, initialGoals }: Props) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showAdd, setShowAdd]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Expense|null>(null);
  const [liveTotal, setLiveTotal] = useState(stats.totalThisMonth);
  const [liveCats, setLiveCats]   = useState(stats.categories);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title:"", amount:"", category:"Food & Dining", date:new Date().toISOString().slice(0,10), note:"" });

  const pct = stats.totalLastMonth > 0 ? ((liveTotal - stats.totalLastMonth) / stats.totalLastMonth * 100).toFixed(1) : null;
  const maxCat   = Math.max(...liveCats.map(c=>c.total), 1);
  const maxMonth = Math.max(...stats.monthly.map(m=>m.total), 1);
  const investReturn = stats.totalInvestmentValue - stats.totalInvested;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/expenses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,amount:parseFloat(form.amount)})});
    const { expense } = await res.json();
    setExpenses(p=>[expense,...p].slice(0,8));
    setLiveTotal(p=>p+expense.amount);
    setLiveCats(p=>{const ex=p.find(c=>c.category===expense.category); return ex?p.map(c=>c.category===expense.category?{...c,total:c.total+expense.amount}:c):[...p,{category:expense.category,total:expense.amount}].sort((a,b)=>b.total-a.total);});
    setForm({title:"",amount:"",category:"Food & Dining",date:new Date().toISOString().slice(0,10),note:""});
    setShowAdd(false); setSaving(false);
  };

  const doDelete = async (ex: Expense) => {
    setExpenses(p=>p.filter(e=>e.id!==ex.id));
    setLiveTotal(p=>Math.max(0,p-ex.amount));
    setLiveCats(p=>p.map(c=>c.category===ex.category?{...c,total:Math.max(0,c.total-ex.amount)}:c).filter(c=>c.total>0));
    await fetch("/api/expenses",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:ex.id})});
    setConfirmDelete(null);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">{new Date().toLocaleString("default",{weekday:"long",day:"numeric",month:"long"})}</p>
        </div>
        <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm">
          ＋ Add Expense
        </button>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:"Spent This Month", value:fmt(liveTotal), sub: pct?`${Number(pct)>0?"+":""}${pct}% vs last month`:"First month!", color: pct&&Number(pct)>0?"text-red-500":"text-green-600" },
          { label:"Transactions",     value:String(stats.totalCount), sub:"All-time total", color:"text-gray-500" },
          { label:"Portfolio Value",  value:fmt(stats.totalInvestmentValue), sub:`${investReturn>=0?"+":""}${fmt(investReturn)} returns`, color:investReturn>=0?"text-green-600":"text-red-500" },
          { label:"Active Goals",     value:String(initialGoals.length), sub:"In progress", color:"text-gray-500" },
        ].map(c=>(
          <div key={c.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{c.value}</p>
            <p className={`text-[11.5px] mt-1 ${c.color}`}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* category */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">By Category</h2>
          {liveCats.length===0?<p className="text-gray-400 text-sm text-center py-6">No data yet</p>:(
            <div className="space-y-3">
              {liveCats.map(c=>(
                <div key={c.category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">{c.category}</span>
                    <span className="text-xs font-semibold text-gray-900">{fmt(c.total)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{width:`${(c.total/maxCat)*100}%`,background:CAT_COLORS[c.category]??"#9ca3af"}}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6-month trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">6-Month Spending Trend</h2>
          {stats.monthly.length===0?<p className="text-gray-400 text-sm text-center py-6">Not enough data yet</p>:(
            <div className="flex items-end gap-2 h-32">
              {stats.monthly.map(m=>(
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-gray-400 font-medium">{fmt(m.total)}</span>
                  <div className="w-full rounded-t-lg bg-orange-100 flex items-end" style={{height:"72px"}}>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-700" style={{height:`${(m.total/maxMonth)*100}%`,minHeight:"4px"}}/>
                  </div>
                  <span className="text-[10px] text-gray-400">{monthLabel(m.month)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* goals preview + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* goals */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">🎯 Goals</h2>
            <a href="/dashboard/goal" className="text-[11.5px] text-orange-500 hover:underline">View all</a>
          </div>
          {initialGoals.length===0?<p className="text-gray-400 text-sm text-center py-4">No goals yet</p>:(
            <div className="space-y-3">
              {initialGoals.map(g=>{
                const pct=Math.min(100,(g.currentAmount/g.targetAmount)*100);
                return (
                  <div key={g.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-700">{g.emoji} {g.title}</span>
                      <span className="text-xs font-semibold text-gray-900">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{width:`${pct}%`}}/>
                    </div>
                    <p className="text-[10.5px] text-gray-400 mt-0.5">{fmt(g.currentAmount)} of {fmt(g.targetAmount)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* recent expenses */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Expenses</h2>
            <a href="/dashboard/transaction" className="text-[11.5px] text-orange-500 hover:underline">View all</a>
          </div>
          {expenses.length===0?<p className="text-gray-400 text-sm text-center py-8">No expenses yet</p>:(
            <ul>
              {expenses.map((e,i)=>(
                <li key={e.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 group transition-colors ${i<expenses.length-1?"border-b border-gray-100":""}`}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{background:CAT_COLORS[e.category]??"#9ca3af"}}>{e.category.slice(0,2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                    <p className="text-[11px] text-gray-400">{e.category} · {new Date(e.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">{fmt(e.amount)}</span>
                  <button onClick={()=>setConfirmDelete(e)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all cursor-pointer text-xs ml-1">🗑</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Add expense modal */}
      {showAdd&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Add Expense</h3>
              <button onClick={()=>setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">×</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" placeholder="e.g. Zomato order" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input required type="number" min="1" step="0.01" placeholder="0" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer">
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Note <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" placeholder="Any detail" value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              <button type="submit" disabled={saving} className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center">
                {saving?<span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"/>:"Save Expense"}</button>
            </form>
          </div>
        </div>
      )}

      {/* delete confirm */}
      {confirmDelete&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-xl shrink-0">🗑</div>
              <h3 className="font-bold text-gray-900">Delete expense?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6 pl-[52px]">"{confirmDelete.title}" ({fmt(confirmDelete.amount)}) will be permanently deleted.</p>
            <div className="flex gap-2.5 justify-end">
              <button onClick={()=>setConfirmDelete(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer">Cancel</button>
              <button onClick={()=>doDelete(confirmDelete)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}