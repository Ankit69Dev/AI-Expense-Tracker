import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import TransactionClient from "@/app/dashboard/transaction/TransactionClient";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select: { id:true, title:true, amount:true, category:true, date:true, note:true, createdAt:true },
  });
  return <TransactionClient initialExpenses={expenses.map((e: { id: any; title: any; amount: any; category: any; date: { toISOString: () => string | any[]; }; note: any; createdAt: { toISOString: () => any; }; })=>({ id:e.id, title:e.title, amount:Number(e.amount), category:e.category, date:e.date.toISOString().slice(0,10), note:e.note??"", createdAt:e.createdAt.toISOString() }))} />;
}