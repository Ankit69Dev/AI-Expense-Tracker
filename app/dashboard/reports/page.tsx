import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ReportsClient from "@/app/dashboard/reports/ReportsClient";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const uid = session.user.id;

  const expenses = await prisma.expense.findMany({ where:{ userId:uid }, orderBy:{ date:"desc" }, select:{ amount:true, category:true, date:true, title:true } });

  // group by month
  const byMonth: Record<string,{total:number;count:number;categories:Record<string,number>}> = {};
  for (const e of expenses) {
    const m = `${e.date.getFullYear()}-${String(e.date.getMonth()+1).padStart(2,"0")}`;
    if (!byMonth[m]) byMonth[m] = {total:0,count:0,categories:{}};
    byMonth[m].total += Number(e.amount);
    byMonth[m].count += 1;
    byMonth[m].categories[e.category] = (byMonth[m].categories[e.category]??0) + Number(e.amount);
  }

  const reports = Object.entries(byMonth).sort((a,b)=>b[0].localeCompare(a[0])).map(([month,data])=>({month,...data}));
  return <ReportsClient reports={reports} totalAll={expenses.reduce((s: number,e: { amount: any; })=>s+Number(e.amount),0)} />;
}