import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const goals = await prisma.goal.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ goals });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, targetAmount, currentAmount, deadline, emoji } = await req.json();
  const goal = await prisma.goal.create({
    data: { userId: session.user.id, title, targetAmount: Number(targetAmount), currentAmount: Number(currentAmount ?? 0), deadline: deadline ? new Date(deadline) : null, emoji: emoji ?? "🎯" },
  });
  return NextResponse.json({ goal }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, currentAmount } = await req.json();
  const goal = await prisma.goal.update({ where: { id, userId: session.user.id }, data: { currentAmount: Number(currentAmount) } });
  return NextResponse.json({ goal });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.goal.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}