// app/api/expenses/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/* ── serialise a Prisma expense row to plain JSON ────────── */
function serialize(e: {
  id: string; title: string; amount: any;
  category: string; date: any; note: string | null; createdAt?: any;
}) {
  return {
    id:        e.id,
    title:     e.title,
    amount:    Number(e.amount),          // Decimal → number
    category:  e.category,
    date:      new Date(e.date as Date).toISOString().slice(0, 10),
    note:      e.note ?? "",
    createdAt: e.createdAt ? new Date(e.createdAt as Date).toISOString() : undefined,
  };
}

/* ── GET ─────────────────────────────────────────────────── */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expenses = await prisma.expense.findMany({
    where:   { userId: session.user.id },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take:    50,
    select:  { id: true, title: true, amount: true, category: true, date: true, note: true, createdAt: true },
  });

  return NextResponse.json({ expenses: expenses.map(serialize) });
}

/* ── POST ────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, category, note } = body;
  const amount = parseFloat(body.amount);
  const date   = body.date ? new Date(body.date) : new Date();

  if (!title || isNaN(amount) || amount <= 0 || !category)
    return NextResponse.json({ error: "title, amount and category are required" }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      userId: session.user.id,
      title,
      amount,
      category,
      date,
      note: note ?? null,
    },
  });

  return NextResponse.json({ expense: serialize(expense) }, { status: 201 });
}

/* ── DELETE ──────────────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.expense.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}