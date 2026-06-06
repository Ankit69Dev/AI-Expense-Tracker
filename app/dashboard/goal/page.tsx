import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import GoalsClient from "@/app/dashboard/goal/GoalsClient";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const goals = await prisma.goal.findMany({ where:{ userId:session.user.id }, orderBy:{ createdAt:"desc" } });
  return <GoalsClient initialGoals={goals.map(g=>({ id:g.id, title:g.title, emoji:g.emoji, targetAmount:Number(g.targetAmount), currentAmount:Number(g.currentAmount), deadline:g.deadline?.toISOString().slice(0,10)??null }))} />;
}