import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, createdAt: true },
  });

  const [expenseCount, goalCount, investmentCount] = await Promise.all([
    prisma.expense.count({ where: { userId: session.user.id } }),
    prisma.goal.count({ where: { userId: session.user.id } }),
    prisma.investment.count({ where: { userId: session.user.id } }),
  ]);

  return (
    <SettingsClient
      user={{
        id:        user?.id ?? "",
        name:      user?.name ?? "",
        email:     user?.email ?? "",
        image:     user?.image ?? null,
        createdAt: user?.createdAt?.toISOString() ?? "",
      }}
      stats={{ expenseCount, goalCount, investmentCount }}
    />
  );
}