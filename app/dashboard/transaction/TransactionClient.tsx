"use client";
import { useState, useMemo } from "react";

const CAT_COLORS: Record<string,string> = {"Food & Dining":"#f97316",Transport:"#3b82f6",Shopping:"#8b5cf6",Entertainment:"#ec4899",Health:"#22c55e",Utilities:"#f59e0b",Rent:"#ef4444",Education:"#06b6d4",Travel:"#14b8a6",Other:"#9ca3af"};
const CATEGORIES = ["All","Food & Dining","Transport","Shopping","Entertainment","Health","Utilities","Rent","Education","Travel","Other"];
const fmt = (n:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);

interface Expense { id:string; title:string; amount:number; category:string; date:string; note:string; createdAt:string; }

export default function TransactionsClient({ initialExpenses }: { initialExpenses: Expense[] }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [search, setSearch]     = useState("");
  const [cat, setCat]           = useState("All");
  const [sort, setSort]         = useState<"date"|"amount">("date");
  const [confirmDelete, setConfirmDelete] = useState<Expense|null>(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({ title:"", amount:"", category:"Food & Dining", date:new Date().toISOString().slice(0,10), note:"" });

  const filtered = useMemo(()=>expenses.filter(e=>{
    const matchCat  = cat==="All"||e.category===cat;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase())||e.category.toLowerCase().includes(search.toLowerCase());
    return matchCat&&matchSearch;
  }).sort((a,b)=>sort==="amount"?b.amount-a.amount:b.date.localeCompare(a.date)),[expenses,search,cat,sort]);

  const total = filtered.reduce((s,e)=>s+e.amount,0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/expenses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,amount:parseFloat(form.amount)})});
    const { expense } = await res.json();
    setExpenses(p=>[expense,...p]);
    setForm({title:"",amount:"",category:"Food & Dining",date:new Date().toISOString().slice(0,10),note:""});
    setShowAdd(false); setSaving(false);
  };

  const doDelete = async (ex: Expense) => {
    setExpenses(p=>p.filter(e=>e.id!==ex.id));
    await fetch("/api/expenses",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:ex.id})});
    setConfirmDelete(null);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-gray-900">💳 Transactions</h1><p className="text-sm text-gray-500 mt-0.5">{expenses.length} total · {fmt(total)} shown</p></div>
        <button onClick={()=>setShowAdd(true)} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">＋ Add</button>
      </div>

      {/* filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 shadow-sm">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search transactions…" className="flex-1 min-w-[160px] h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/>
        <select value={cat} onChange={e=>setCat(e.target.value)} className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-orange-400 cursor-pointer">
          {CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
        <select value={sort} onChange={e=>setSort(e.target.value as "date"|"amount")} className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-orange-400 cursor-pointer">
          <option value="date">Sort: Date</option><option value="amount">Sort: Amount</option></select>
      </div>

      {/* table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          <span>Cat</span><span>Title</span><span>Category</span><span>Date</span><span>Amount</span>
        </div>
        {filtered.length===0?<p className="text-center text-gray-400 text-sm py-10">No transactions found</p>:(
          <ul>
            {filtered.map((e,i)=>(
              <li key={e.id} className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 group transition-colors ${i<filtered.length-1?"border-b border-gray-100":""}`}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{background:CAT_COLORS[e.category]??"#9ca3af"}}>{e.category.slice(0,2).toUpperCase()}</div>
                <div className="min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>{e.note&&<p className="text-[11px] text-gray-400 truncate">{e.note}</p>}</div>
                <span className="text-[11.5px] px-2 py-0.5 rounded-full font-medium" style={{background:(CAT_COLORS[e.category]??"#9ca3af")+"20",color:CAT_COLORS[e.category]??"#9ca3af"}}>{e.category}</span>
                <span className="text-[12px] text-gray-500 whitespace-nowrap">{new Date(e.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{fmt(e.amount)}</span>
                  <button onClick={()=>setConfirmDelete(e)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all cursor-pointer text-xs">🗑</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* add modal */}
      {showAdd&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-gray-900">Add Expense</h3><button onClick={()=>setShowAdd(false)} className="text-gray-400 text-xl cursor-pointer">×</button></div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Title</label><input required type="text" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹)</label><input required type="number" min="1" step="0.01" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Category</label><select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 cursor-pointer">{CATEGORIES.slice(1).map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Date</label><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Note</label><input type="text" value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              <button type="submit" disabled={saving} className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold cursor-pointer disabled:opacity-60 flex items-center justify-center">{saving?<span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"/>:"Save"}</button>
            </form>
          </div>
        </div>
      )}

      {confirmDelete&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-xl">🗑</div><h3 className="font-bold text-gray-900">Delete?</h3></div>
            <p className="text-sm text-gray-500 mb-6 pl-[52px]">"{confirmDelete.title}" will be permanently deleted.</p>
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