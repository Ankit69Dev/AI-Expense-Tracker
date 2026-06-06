"use client";
import { useState } from "react";
const fmt = (n:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const EMOJIS = ["🎯","🏠","✈️","🎓","🚗","💍","📱","💊","🏋️","🌴","💰","🛡️"];

interface Goal { id:string; title:string; emoji:string; targetAmount:number; currentAmount:number; deadline:string|null; }

export default function GoalsClient({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState(initialGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [addAmount, setAddAmount] = useState<{id:string;val:string}|null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Goal|null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title:"", emoji:"🎯", targetAmount:"", currentAmount:"", deadline:"" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/goals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const { goal } = await res.json();
    setGoals(p=>[goal,...p]); setShowAdd(false); setSaving(false);
    setForm({title:"",emoji:"🎯",targetAmount:"",currentAmount:"",deadline:""});
  };

  const handleAddAmount = async (id: string, current: number) => {
    const add = parseFloat(addAmount?.val??"0");
    if (!add) return;
    const newVal = current + add;
    const res = await fetch("/api/goals",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,currentAmount:newVal})});
    const { goal } = await res.json();
    setGoals(p=>p.map(g=>g.id===id?{...g,currentAmount:Number(goal.currentAmount)}:g));
    setAddAmount(null);
  };

  const doDelete = async (g: Goal) => {
    await fetch("/api/goals",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:g.id})});
    setGoals(p=>p.filter(x=>x.id!==g.id)); setConfirmDelete(null);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-gray-900">🎯 Goals</h1><p className="text-sm text-gray-500 mt-0.5">{goals.length} goals · {goals.filter(g=>g.currentAmount>=g.targetAmount).length} completed</p></div>
        <button onClick={()=>setShowAdd(true)} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">＋ New Goal</button>
      </div>

      {goals.length===0?(<div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm"><p className="text-4xl mb-3">🎯</p><p className="text-gray-900 font-semibold mb-1">No goals yet</p><p className="text-gray-400 text-sm mb-4">Set a savings goal and track your progress</p><button onClick={()=>setShowAdd(true)} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer">Create First Goal</button></div>):(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map(g=>{
            const pct = Math.min(100,(g.currentAmount/g.targetAmount)*100);
            const done = pct >= 100;
            const daysLeft = g.deadline?Math.ceil((new Date(g.deadline).getTime()-Date.now())/(1000*60*60*24)):null;
            return (
              <div key={g.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${done?"border-green-200 bg-green-50/30":"border-gray-200"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{g.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{g.title}</p>
                      {done&&<span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">✓ Completed</span>}
                    </div>
                  </div>
                  <button onClick={()=>setConfirmDelete(g)} className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer text-xs">🗑</button>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-gray-500">{fmt(g.currentAmount)} saved</span>
                    <span className="text-xs font-semibold text-gray-900">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${done?"bg-green-500":"bg-orange-500"}`} style={{width:`${pct}%`}}/>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Target: {fmt(g.targetAmount)}{daysLeft!==null&&<span className={`ml-2 ${daysLeft<0?"text-red-400":daysLeft<30?"text-orange-400":"text-gray-400"}`}>{daysLeft<0?"Overdue":daysLeft===0?"Due today":`${daysLeft}d left`}</span>}</p>
                </div>
                {!done&&(
                  addAmount?.id===g.id?(
                    <div className="flex gap-2">
                      <input type="number" min="1" placeholder="Amount" value={addAmount.val} onChange={e=>setAddAmount({id:g.id,val:e.target.value})} className="flex-1 h-8 rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs outline-none focus:border-orange-400"/>
                      <button onClick={()=>handleAddAmount(g.id,g.currentAmount)} className="px-3 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold cursor-pointer">Add</button>
                      <button onClick={()=>setAddAmount(null)} className="px-2 h-8 rounded-lg bg-gray-100 text-gray-500 text-xs cursor-pointer">×</button>
                    </div>
                  ):(
                    <button onClick={()=>setAddAmount({id:g.id,val:""})} className="w-full h-8 rounded-lg border border-orange-200 text-orange-600 text-xs font-medium hover:bg-orange-50 transition-colors cursor-pointer">+ Add Money</button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAdd&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-gray-900">New Goal</h3><button onClick={()=>setShowAdd(false)} className="text-gray-400 text-xl cursor-pointer">×</button></div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Goal Name</label><input required type="text" placeholder="e.g. Emergency Fund" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-2">Emoji</label><div className="flex flex-wrap gap-2">{EMOJIS.map(em=><button key={em} type="button" onClick={()=>setForm(p=>({...p,emoji:em}))} className={`w-9 h-9 rounded-xl text-xl transition-all ${form.emoji===em?"ring-2 ring-orange-400 bg-orange-50":"bg-gray-50 hover:bg-gray-100"} cursor-pointer`}>{em}</button>)}</div></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Target Amount (₹)</label><input required type="number" min="1" value={form.targetAmount} onChange={e=>setForm(p=>({...p,targetAmount:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Already Saved (₹)</label><input type="number" min="0" value={form.currentAmount} onChange={e=>setForm(p=>({...p,currentAmount:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Deadline <span className="text-gray-400 font-normal">(optional)</span></label><input type="date" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/></div>
              <button type="submit" disabled={saving} className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold cursor-pointer disabled:opacity-60 flex items-center justify-center">{saving?<span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"/>:"Create Goal"}</button>
            </form>
          </div>
        </div>
      )}

      {confirmDelete&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-xl">🗑</div><h3 className="font-bold text-gray-900">Delete goal?</h3></div>
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