import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardHome from "@/app/dashboard/DashboardHome";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const uid = session.user.id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const lastStart  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastEnd    = new Date(now.getFullYear(), now.getMonth(), 0);
  const sixAgo     = new Date(); sixAgo.setMonth(sixAgo.getMonth() - 6);

  const [thisMonth, lastMonth, trend, recent, count, goals, investments] = await Promise.all([
    prisma.expense.findMany({ where: { userId: uid, date: { gte: monthStart, lte: monthEnd } }, select: { amount: true, category: true } }),
    prisma.expense.findMany({ where: { userId: uid, date: { gte: lastStart,  lte: lastEnd  } }, select: { amount: true } }),
    prisma.expense.findMany({ where: { userId: uid, date: { gte: sixAgo } }, select: { amount: true, date: true }, orderBy: { date: "asc" } }),
    prisma.expense.findMany({ where: { userId: uid }, orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 8, select: { id: true, title: true, amount: true, category: true, date: true, note: true } }),
    prisma.expense.count({ where: { userId: uid } }),
    prisma.goal.findMany({ where: { userId: uid }, take: 3 }),
    prisma.investment.findMany({ where: { userId: uid } }),
  ]);

  const totalThisMonth = thisMonth.reduce((s: number, e: { amount: any; }) => s + Number(e.amount), 0);
  const totalLastMonth = lastMonth.reduce((s: number, e: { amount: any; }) => s + Number(e.amount), 0);

  const catMap = new Map<string, number>();
  for (const e of thisMonth) catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount));
  const categories = [...catMap.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);

  const monthMap = new Map<string, number>();
  for (const e of trend) {
    const k = `${e.date.getFullYear()}-${String(e.date.getMonth()+1).padStart(2,"0")}`;
    monthMap.set(k, (monthMap.get(k) ?? 0) + Number(e.amount));
  }
  const monthly = [...monthMap.entries()].map(([month, total]) => ({ month, total })).sort((a, b) => a.month.localeCompare(b.month));

  const totalInvested = investments.reduce((s: number, i: { amountInvested: any; }) => s + Number(i.amountInvested), 0);
  const totalInvestmentValue = investments.reduce((s: number, i: { currentValue: any; }) => s + Number(i.currentValue), 0);

  return (
    <DashboardHome
      user={{ id: uid, name: session.user.name ?? "User", email: session.user.email ?? "", image: session.user.image ?? null }}
      stats={{ totalThisMonth, totalLastMonth, categories, monthly, totalCount: count, totalInvested, totalInvestmentValue }}
      initialExpenses={recent.map((e: { id: any; title: any; amount: any; category: any; date: { toISOString: () => string | any[]; }; note: any; }) => ({ id: e.id, title: e.title, amount: Number(e.amount), category: e.category, date: e.date.toISOString().slice(0,10), note: e.note ?? "" }))}
      initialGoals={goals.map((g: { id: any; title: any; emoji: any; targetAmount: any; currentAmount: any; deadline: { toISOString: () => string | any[]; }; }) => ({ id: g.id, title: g.title, emoji: g.emoji, targetAmount: Number(g.targetAmount), currentAmount: Number(g.currentAmount), deadline: g.deadline?.toISOString().slice(0,10) ?? null }))}
    />
  );
}