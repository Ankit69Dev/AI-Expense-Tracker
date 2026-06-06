import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const investments = await prisma.investment.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ investments });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, type, amountInvested, currentValue, platform } = await req.json();
  const inv = await prisma.investment.create({
    data: { userId: session.user.id, name, type, amountInvested: Number(amountInvested), currentValue: Number(currentValue ?? amountInvested), platform: platform ?? "" },
  });
  return NextResponse.json({ investment: inv }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, currentValue } = await req.json();
  const inv = await prisma.investment.update({ where: { id, userId: session.user.id }, data: { currentValue: Number(currentValue) } });
  return NextResponse.json({ investment: inv });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.investment.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}