"use client";
import { useState } from "react";
const fmt = (n:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const TYPE_COLORS: Record<string,string> = {Stocks:"#3b82f6",MutualFunds:"#8b5cf6",Crypto:"#f59e0b",FD:"#22c55e",Gold:"#f97316",Other:"#9ca3af"};
const TYPES = ["Stocks","MutualFunds","Crypto","FD","Gold","Other"];

interface Investment { id:string; name:string; type:string; amountInvested:number; currentValue:number; platform:string; }

export default function InvestmentsClient({ initialInvestments }: { initialInvestments: Investment[] }) {
  const [investments, setInvestments] = useState(initialInvestments);
  const [showAdd, setShowAdd] = useState(false);
  const [updateVal, setUpdateVal] = useState<{id:string;val:string}|null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Investment|null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", type:"Stocks", amountInvested:"", currentValue:"", platform:"" });

  const totalInvested = investments.reduce((s,i)=>s+i.amountInvested,0);
  const totalCurrent  = investments.reduce((s,i)=>s+i.currentValue,0);
  const totalReturn   = totalCurrent - totalInvested;
  const returnPct     = totalInvested>0?((totalReturn/totalInvested)*100).toFixed(2):"0";

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/investments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const { investment } = await res.json();
    setInvestments(p=>[investment,...p]); setShowAdd(false); setSaving(false);
    setForm({name:"",type:"Stocks",amountInvested:"",currentValue:"",platform:""});
  };

  const handleUpdate = async (id: string) => {
    const val = parseFloat(updateVal?.val??"0");
    if (!val) return;
    const res = await fetch("/api/investments",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,currentValue:val})});
    const { investment } = await res.json();
    setInvestments(p=>p.map(i=>i.id===id?{...i,currentValue:Number(investment.currentValue)}:i));
    setUpdateVal(null);
  };

  const doDelete = async (inv: Investment) => {
    await fetch("/api/investments",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:inv.id})});
    setInvestments(p=>p.filter(i=>i.id!==inv.id)); setConfirmDelete(null);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-gray-900">💰 Investments</h1><p className="text-sm text-gray-500 mt-0.5">Portfolio tracker</p></div>
        <button onClick={()=>setShowAdd(true)} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer">＋ Add Investment</button>
      </div>

      {/* summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {label:"Total Invested",   value:fmt(totalInvested), color:"text-gray-500"},
          {label:"Current Value",    value:fmt(totalCurrent),  color:"text-gray-500"},
          {label:"Total Return",     value:(totalReturn>=0?"+":"")+fmt(totalReturn), color:totalReturn>=0?"text-green-600":"text-red-500"},
          {label:"Return %",         value:(Number(returnPct)>=0?"+":"")+returnPct+"%", color:Number(returnPct)>=0?"text-green-600":"text-red-500"},
        ].map(c=>(
          <div key={c.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">{c.label}</p>
            <p className={`text-2xl font-bold tracking-tight ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {investments.length===0?(<div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm"><p className="text-4xl mb-3">💰</p><p className="text-gray-900 font-semibold mb-1">No investments yet</p><p className="text-gray-400 text-sm mb-4">Track your stocks, mutual funds, crypto and more</p><button onClick={()=>setShowAdd(true)} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer">Add First Investment</button></div>):(
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            <span>Type</span><span>Name</span><span>Invested</span><span>Current</span><span>Return</span><span></span>
          </div>
          <ul>
            {investments.map((inv,i)=>{
              const ret = inv.currentValue - inv.amountInvested;
              const retPct = inv.amountInvested>0?((ret/inv.amountInvested)*100).toFixed(1):"0";
              return (
                <li key={inv.id} className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50 group transition-colors ${i<investments.length-1?"border-b border-gray-100":""}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{background:TYPE_COLORS[inv.type]??"#9ca3af"}}>{inv.type.slice(0,2).toUpperCase()}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{inv.name}</p>
                    <p className="text-[11px] text-gray-400">{inv.type}{inv.platform&&` · ${inv.platform}`}</p>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{fmt(inv.amountInvested)}</span>
                  {updateVal?.id===inv.id?(
                    <div className="flex gap-1.5 items-center">
                      <input type="number" value={updateVal.val} onChange={e=>setUpdateVal({id:inv.id,val:e.target.value})} className="w-24 h-8 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs outline-none focus:border-orange-400"/>
                      <button onClick={()=>handleUpdate(inv.id)} className="px-2 h-8 rounded-lg bg-orange-500 text-white text-xs cursor-pointer">✓</button>
                      <button onClick={()=>setUpdateVal(null)} className="px-1.5 h-8 rounded-lg bg-gray-100 text-gray-500 text-xs cursor-pointer">×</button>
                    </div>
                  ):(
                    <button onClick={()=>setUpdateVal({id:inv.id,val:String(inv.currentValue)})} className="text-sm font-medium text-gray-900 hover:text-orange-500 transition-colors cursor-pointer text-left">{fmt(inv.currentValue)}</button>
                  )}
                  <span className={`text-sm font-semibold ${ret>=0?"text-green-600":"text-red-500"}`}>{ret>=0?"+":""}{fmt(ret)} <span className="text-[11px] font-normal">({ret>=0?"+":""}{retPct}%)</span></span>
                  <button onClick={()=>setConfirmDelete(inv)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer text-xs">🗑</button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {showAdd&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-gray-900">Add Investment</h3><button onClick={()=>setShowAdd(false)} className="text-gray-400 text-xl cursor-pointer">×</button></div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Name</label><input required type="text" placeholder="e.g. HDFC Nifty 50 Fund" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Type</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 cursor-pointer">{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Platform</label><input type="text" placeholder="e.g. Zerodha" value={form.platform} onChange={e=>setForm(p=>({...p,platform:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Amount Invested (₹)</label><input required type="number" min="1" value={form.amountInvested} onChange={e=>setForm(p=>({...p,amountInvested:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Current Value (₹)</label><input type="number" min="0" value={form.currentValue} onChange={e=>setForm(p=>({...p,currentValue:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              </div>
              <button type="submit" disabled={saving} className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold cursor-pointer disabled:opacity-60 flex items-center justify-center">{saving?<span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"/>:"Add Investment"}</button>
            </form>
          </div>
        </div>
      )}
      {confirmDelete&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-xl">🗑</div><h3 className="font-bold text-gray-900">Remove investment?</h3></div>
            <p className="text-sm text-gray-500 mb-6 pl-[52px]">"{confirmDelete.name}" will be removed from your portfolio.</p>
            <div className="flex gap-2.5 justify-end">
              <button onClick={()=>setConfirmDelete(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer">Cancel</button>
              <button onClick={()=>doDelete(confirmDelete)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 cursor-pointer">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}