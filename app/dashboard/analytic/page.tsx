import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AnalyticsClient from "@/app/dashboard/analytic/AnalyticsClient";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const uid = session.user.id;
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [all, thisYear] = await Promise.all([
    prisma.expense.findMany({ where:{ userId:uid }, select:{ amount:true, category:true, date:true } }),
    prisma.expense.findMany({ where:{ userId:uid, date:{ gte:yearStart } }, select:{ amount:true, category:true, date:true } }),
  ]);

  // monthly by category for heatmap
  const monthCat: Record<string, Record<string, number>> = {};
  for (const e of thisYear) {
    const m = `${e.date.getFullYear()}-${String(e.date.getMonth()+1).padStart(2,"0")}`;
    if (!monthCat[m]) monthCat[m] = {};
    monthCat[m][e.category] = (monthCat[m][e.category]??0) + Number(e.amount);
  }

  const catTotal: Record<string, number> = {};
  for (const e of all) catTotal[e.category] = (catTotal[e.category]??0) + Number(e.amount);

  const monthTotal: Record<string, number> = {};
  for (const e of all) {
    const m = `${e.date.getFullYear()}-${String(e.date.getMonth()+1).padStart(2,"0")}`;
    monthTotal[m] = (monthTotal[m]??0) + Number(e.amount);
  }

  return <AnalyticsClient
    catTotal={catTotal}
    monthTotal={Object.entries(monthTotal).sort((a,b)=>a[0].localeCompare(b[0])).slice(-12)}
    monthCat={monthCat}
    totalAll={all.reduce((s,e)=>s+Number(e.amount),0)}
    totalCount={all.length}
  />;
}