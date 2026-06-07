// app/dashboard/transactions/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import TransactionsClient from "./TransactionClient";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const expenses = await prisma.expense.findMany({
    where:   { userId: session.user.id },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select:  { id: true, title: true, amount: true, category: true, date: true, note: true, createdAt: true },
  });

  return (
    <TransactionsClient
      initialExpenses={expenses.map((e) => ({
        id:        e.id,
        title:     e.title,
        amount:    Number(e.amount),
        category:  e.category,
        date:      new Date(e.date as Date).toISOString().slice(0, 10),
        note:      e.note ?? "",
        createdAt: new Date(e.createdAt as Date).toISOString(),
      }))}
    />
  );
}