import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, history } = await req.json();
  const uid = session.user.id;

  // Fetch user's real expense data for context
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [expenses, monthlyExpenses] = await Promise.all([
    prisma.expense.findMany({ where: { userId: uid }, orderBy: { date: "desc" }, take: 30, select: { title: true, amount: true, category: true, date: true } }),
    prisma.expense.findMany({ where: { userId: uid, date: { gte: monthStart } }, select: { amount: true, category: true } }),
  ]);

  const totalThisMonth = monthlyExpenses.reduce((s: number, e: { amount: any; }) => s + Number(e.amount), 0);
  const catMap = new Map<string, number>();
  for (const e of monthlyExpenses) catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount));
  const topCategories = [...catMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const systemPrompt = `You are SpendWise AI, a friendly and expert personal finance assistant.

The user's real financial data:
- Total spent this month: ₹${totalThisMonth.toFixed(0)}
- Top spending categories: ${topCategories.map(([c, a]) => `${c} ₹${a.toFixed(0)}`).join(", ")}
- Recent expenses (last 30): ${expenses.map((e: { title: any; amount: any; category: any; date: any; }) => `${e.title} ₹${Number(e.amount)} (${e.category}) on ${String(e.date).slice(0,10)}`).join("; ")}

Give specific, actionable advice based on THEIR real data. Be concise, warm, and practical. Use ₹ for currency. Format with bullet points when listing multiple items. Keep responses under 200 words.`;

  const messages = [
    ...(history || []),
    { role: "user" as const, content: message },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    max_tokens: 400,
    temperature: 0.7,
  });

  const reply = completion.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
  return NextResponse.json({ reply });
}