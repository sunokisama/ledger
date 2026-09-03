import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { accounts, transactions } from "../../../db/schema";
import { authenticatedUserId } from "../auth";

export async function GET() {
  try {
    const uid = await authenticatedUserId();
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
    const accountId = Number(body.accountId);
    const currency = String(body.currency ?? "");
    const direction = String(body.direction ?? "");
    const transactionModule = String(body.module ?? "");
    const amountMinor = Math.round(Number(body.amount) * 100);
    if (!title || !Number.isInteger(accountId) || !["JPY", "CNY"].includes(currency) || !["income", "expense"].includes(direction) || !["daily", "proxy"].includes(transactionModule) || !Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
      return Response.json({ error: "请完整填写有效的交易信息" }, { status: 400 });
    }
    const uid = await authenticatedUserId();
    const [account] = await getDb().select().from(accounts).where(and(eq(accounts.id, accountId), eq(accounts.userId, uid))).limit(1);
    if (!account) return Response.json({ error: "账户不存在" }, { status: 404 });
    if (account.currency !== currency) return Response.json({ error: `该账户仅支持 ${account.currency}` }, { status: 400 });
    const [row] = await getDb().insert(transactions).values({
      userId: uid, title, account: account.name, accountId, currency, direction, module: transactionModule,
      amountMinor, note: String(body.note ?? "").trim(), occurredAt: String(body.occurredAt ?? new Date().toISOString()),
    }).returning();
    return Response.json({ transaction: row }, { status: 201 });
  } catch (error) {
    console.error("transactions.POST", error);
    return Response.json({ error: "保存失败，请稍后重试" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; const id = Number(body.id); const accountId = Number(body.accountId);
    const title = String(body.title ?? "").trim(); const currency = String(body.currency ?? ""); const direction = String(body.direction ?? ""); const transactionModule = String(body.module ?? "");
    const amountMinor = Math.round(Number(body.amount) * 100); const uid = await authenticatedUserId();
    if (!Number.isInteger(id) || !Number.isInteger(accountId) || !title || !["JPY", "CNY"].includes(currency) || !["income", "expense"].includes(direction) || !["daily", "proxy"].includes(transactionModule) || !Number.isSafeInteger(amountMinor) || amountMinor <= 0) return Response.json({ error: "请完整填写有效的交易信息" }, { status: 400 });
    const [account] = await getDb().select().from(accounts).where(and(eq(accounts.id, accountId), eq(accounts.userId, uid))).limit(1);
    if (!account) return Response.json({ error: "账户不存在" }, { status: 404 });
    if (account.currency !== currency) return Response.json({ error: `该账户仅支持 ${account.currency}` }, { status: 400 });
    const [transaction] = await getDb().update(transactions).set({ title, account: account.name, accountId, currency, direction, module: transactionModule, amountMinor, note: String(body.note ?? "").trim(), occurredAt: String(body.occurredAt ?? new Date().toISOString()) }).where(and(eq(transactions.id, id), eq(transactions.userId, uid))).returning();
    return transaction ? Response.json({ transaction }) : Response.json({ error: "流水不存在" }, { status: 404 });
  } catch (error) { console.error("transactions.PUT", error); return Response.json({ error: "更新失败" }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return Response.json({ error: "无效记录" }, { status: 400 });
    const uid = await authenticatedUserId();
    await getDb().delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, uid)));
    return Response.json({ ok: true });
  } catch (error) {
    console.error("transactions.DELETE", error);
    return Response.json({ error: "删除失败" }, { status: 500 });
  }
}
