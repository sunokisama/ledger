import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "../../../db";
import { transactions } from "../../../db/schema";

async function userId() {
  const h = await headers();
  return h.get("oai-authenticated-user-id") ?? "local-demo-user";
}

export async function GET() {
  try {
    const uid = await userId();
    const rows = await getDb().select().from(transactions).where(eq(transactions.userId, uid)).orderBy(desc(transactions.occurredAt), desc(transactions.id)).limit(100);
    return Response.json({ transactions: rows });
  } catch (error) {
    console.error("transactions.GET", error);
    return Response.json({ error: "账本数据暂时无法读取" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const title = String(body.title ?? "").trim();
    const account = String(body.account ?? "").trim();
    const currency = String(body.currency ?? "");
    const direction = String(body.direction ?? "");
    const module = String(body.module ?? "");
    const amount = Number(body.amount);
    if (!title || !account || !["JPY", "CNY"].includes(currency) || !["income", "expense"].includes(direction) || !["daily", "proxy"].includes(module) || !Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: "请完整填写有效的交易信息" }, { status: 400 });
    }
    const [row] = await getDb().insert(transactions).values({
      userId: await userId(), title, account, currency, direction, module,
      amountMinor: Math.round(amount * 100), note: String(body.note ?? "").trim(), occurredAt: new Date().toISOString(),
    }).returning();
    return Response.json({ transaction: row }, { status: 201 });
  } catch (error) {
    console.error("transactions.POST", error);
    return Response.json({ error: "保存失败，请稍后重试" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return Response.json({ error: "无效记录" }, { status: 400 });
    const uid = await userId();
    await getDb().delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, uid)));
    return Response.json({ ok: true });
  } catch (error) {
    console.error("transactions.DELETE", error);
    return Response.json({ error: "删除失败" }, { status: 500 });
  }
}
