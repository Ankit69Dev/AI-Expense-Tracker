import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import InvestmentsClient from "@/app/dashboard/investment/InvestmentClient";

export default async function InvestmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const invs = await prisma.investment.findMany({ where:{ userId:session.user.id }, orderBy:{ createdAt:"desc" } });
  return <InvestmentsClient initialInvestments={invs.map(i=>({ id:i.id, name:i.name, type:i.type, amountInvested:Number(i.amountInvested), currentValue:Number(i.currentValue), platform:i.platform??"" }))} />;
}