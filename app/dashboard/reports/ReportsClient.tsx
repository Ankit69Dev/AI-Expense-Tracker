"use client";
import { useState } from "react";
const fmt = (n:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const CAT_COLORS: Record<string,string> = {"Food & Dining":"#f97316",Transport:"#3b82f6",Shopping:"#8b5cf6",Entertainment:"#ec4899",Health:"#22c55e",Utilities:"#f59e0b",Rent:"#ef4444",Education:"#06b6d4",Travel:"#14b8a6",Other:"#9ca3af"};
const monthName = (ym:string) => { const [y,m]=ym.split("-"); return new Date(Number(y),Number(m)-1).toLocaleString("default",{month:"long",year:"numeric"}); };

interface Report { month:string; total:number; count:number; categories:Record<string,number>; }

export default function ReportsClient({ reports, totalAll }: { reports:Report[]; totalAll:number }) {
  const [expanded, setExpanded] = useState<string|null>(reports[0]?.month??null);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">📄 Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monthly spending reports · All time total: {fmt(totalAll)}</p>
      </div>

      {reports.length===0?(<div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm"><p className="text-4xl mb-3">📄</p><p className="text-gray-900 font-semibold mb-1">No reports yet</p><p className="text-gray-400 text-sm">Add expenses to generate monthly reports</p></div>):(
        <div className="space-y-3">
          {reports.map((r,i)=>{
            const isOpen = expanded===r.month;
            const cats = Object.entries(r.categories).sort((a,b)=>b[1]-a[1]);
            const maxCat = Math.max(...cats.map(c=>c[1]),1);
            const prev = reports[i+1];
            const change = prev?((r.total-prev.total)/prev.total*100).toFixed(1):null;
            return (
              <div key={r.month} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <button onClick={()=>setExpanded(isOpen?null:r.month)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{monthName(r.month)}</p>
                      <p className="text-[12px] text-gray-400">{r.count} transactions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {change&&<span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${Number(change)>0?"bg-red-50 text-red-500":"bg-green-50 text-green-600"}`}>{Number(change)>0?"+":""}{change}%</span>}
                    <p className="text-lg font-bold text-gray-900">{fmt(r.total)}</p>
                    <span className={`text-gray-400 transition-transform ${isOpen?"rotate-180":""}`}>▾</span>
                  </div>
                </button>
                {isOpen&&(
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="pt-4 space-y-3">
                      {cats.map(([cat,total])=>(
                        <div key={cat}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-gray-700 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{background:CAT_COLORS[cat]??"#9ca3af"}}/>{cat}</span>
                            <span className="text-xs font-semibold text-gray-900">{fmt(total)} <span className="text-gray-400 font-normal">({((total/r.total)*100).toFixed(0)}%)</span></span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{width:`${(total/maxCat)*100}%`,background:CAT_COLORS[cat]??"#9ca3af"}}/>
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