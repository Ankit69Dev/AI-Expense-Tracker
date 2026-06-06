"use client";
const CAT_COLORS: Record<string,string> = {"Food & Dining":"#f97316",Transport:"#3b82f6",Shopping:"#8b5cf6",Entertainment:"#ec4899",Health:"#22c55e",Utilities:"#f59e0b",Rent:"#ef4444",Education:"#06b6d4",Travel:"#14b8a6",Other:"#9ca3af"};
const fmt = (n:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const monthLabel = (ym:string) => { const [y,m]=ym.split("-"); return new Date(Number(y),Number(m)-1).toLocaleString("default",{month:"short",year:"2-digit"}); };

interface Props {
  catTotal: Record<string,number>;
  monthTotal: [string,number][];
  monthCat: Record<string,Record<string,number>>;
  totalAll: number;
  totalCount: number;
}

export default function AnalyticsClient({ catTotal, monthTotal, totalAll, totalCount }: Props) {
  const cats = Object.entries(catTotal).sort((a,b)=>b[1]-a[1]);
  const maxMonth = Math.max(...monthTotal.map(m=>m[1]),1);
  const maxCat   = Math.max(...cats.map(c=>c[1]),1);
  const avgMonthly = monthTotal.length>0?monthTotal.reduce((s,m)=>s+m[1],0)/monthTotal.length:0;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="mb-6"><h1 className="text-xl font-bold text-gray-900">📊 Analytics</h1><p className="text-sm text-gray-500 mt-0.5">All-time spending breakdown</p></div>

      {/* summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {label:"Total Spent",    value:fmt(totalAll),       sub:"All time"},
          {label:"Transactions",   value:String(totalCount),  sub:"All time"},
          {label:"Avg / Month",    value:fmt(avgMonthly),     sub:"Last 12 months"},
          {label:"Top Category",   value:cats[0]?cats[0][0].split(" ")[0]:"—", sub:cats[0]?fmt(cats[0][1]):""},
        ].map(c=>(
          <div key={c.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{c.value}</p>
            <p className="text-[11.5px] text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* monthly bar chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Monthly Spending (Last 12)</h2>
          {monthTotal.length===0?<p className="text-gray-400 text-sm text-center py-8">No data</p>:(
            <div className="flex items-end gap-1.5 h-40">
              {monthTotal.map(([m,total])=>(
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-orange-100 flex items-end" style={{height:"100px"}}>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-700" style={{height:`${(total/maxMonth)*100}%`,minHeight:"3px"}}/>
                  </div>
                  <span className="text-[9px] text-gray-400 -rotate-45 origin-left mt-1 whitespace-nowrap">{monthLabel(m)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* donut-style category breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Spending by Category</h2>
          {cats.length===0?<p className="text-gray-400 text-sm text-center py-8">No data</p>:(
            <div className="space-y-2.5">
              {cats.map(([cat,total])=>(
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:CAT_COLORS[cat]??"#9ca3af"}}/>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-700">{cat}</span>
                      <span className="text-xs font-semibold text-gray-900">{fmt(total)} <span className="text-gray-400 font-normal">({((total/totalAll)*100).toFixed(1)}%)</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{width:`${(total/maxCat)*100}%`,background:CAT_COLORS[cat]??"#9ca3af"}}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* insights */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">🤖 AI Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cats[0]&&<div className="bg-orange-50 rounded-xl p-4"><p className="text-xs font-semibold text-orange-700 mb-1">Biggest Spend</p><p className="text-sm text-orange-900">{cats[0][0]} makes up {((cats[0][1]/totalAll)*100).toFixed(0)}% of all spending ({fmt(cats[0][1])}).</p></div>}
          {avgMonthly>0&&<div className="bg-blue-50 rounded-xl p-4"><p className="text-xs font-semibold text-blue-700 mb-1">Monthly Average</p><p className="text-sm text-blue-900">You spend {fmt(avgMonthly)} on average each month. Try to keep it under {fmt(avgMonthly*0.9)}.</p></div>}
          {cats.length>1&&<div className="bg-green-50 rounded-xl p-4"><p className="text-xs font-semibold text-green-700 mb-1">Potential Savings</p><p className="text-sm text-green-900">Cutting {cats[cats.length-1][0]} by 20% could save you {fmt(cats[cats.length-1][1]*0.2)} this year.</p></div>}
        </div>
      </div>
    </div>
  );
}