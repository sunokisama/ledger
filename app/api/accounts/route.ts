import { and, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { accounts, transactions } from "../../../db/schema";
import { authenticatedUserId } from "../auth";

const currencies = ["JPY", "CNY"];
const types = ["cash", "bank", "wallet", "credit"];
const money = (value: unknown) => Math.round(Number(value) * 100);

export async function GET() {
  try {
    const uid = await authenticatedUserId();
    const db = getDb();
    const [ownedAccounts, ownedTransactions] = await Promise.all([
      db.select().from(accounts).where(eq(accounts.userId, uid)),
      db.select({ accountId: transactions.accountId, amountMinor: transactions.amountMinor, direction: transactions.direction })
        .from(transactions).where(eq(transactions.userId, uid)),
    ]);
    const deltas = new Map<number, number>();
    for (const tx of ownedTransactions) if (tx.accountId) deltas.set(tx.accountId, (deltas.get(tx.accountId) ?? 0) + (tx.direction === "income" ? tx.amountMinor : -tx.amountMinor));
    return Response.json({ accounts: ownedAccounts.map(account => ({ ...account, balanceMinor: account.initialBalanceMinor + (deltas.get(account.id) ?? 0) })) });
  } catch (error) {
    console.error("accounts.GET", error);
    return Response.json({ error: "账户暂时无法读取" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    const currency = String(body.currency ?? "");
    const type = String(body.type ?? "");
    const initialBalanceMinor = money(body.initialBalance ?? 0);
    if (!name || !currencies.includes(currency) || !types.includes(type) || !Number.isSafeInteger(initialBalanceMinor)) return Response.json({ error: "请填写有效的账户信息" }, { status: 400 });
    const [account] = await getDb().insert(accounts).values({ userId: await authenticatedUserId(), name, currency, type, initialBalanceMinor }).returning();
    return Response.json({ account: { ...account, balanceMinor: initialBalanceMinor } }, { status: 201 });
  } catch (error) {
    console.error("accounts.POST", error);
    return Response.json({ error: "账户名称不能重复" }, { status: 409 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = Number(body.id); const name = String(body.name ?? "").trim(); const type = String(body.type ?? "");
    const initialBalanceMinor = money(body.initialBalance ?? 0); const uid = await authenticatedUserId();
    if (!Number.isInteger(id) || !name || !types.includes(type) || !Number.isSafeInteger(initialBalanceMinor)) return Response.json({ error: "请填写有效的账户信息" }, { status: 400 });
    const [account] = await getDb().update(accounts).set({ name, type, initialBalanceMinor, updatedAt: new Date().toISOString() }).where(and(eq(accounts.id, id), eq(accounts.userId, uid))).returning();
    if (!account) return Response.json({ error: "账户不存在" }, { status: 404 });
    return Response.json({ account });
  } catch (error) { console.error("accounts.PUT", error); return Response.json({ error: "更新账户失败" }, { status: 409 }); }
}

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id")); const uid = await authenticatedUserId();
  if (!Number.isInteger(id)) return Response.json({ error: "无效账户" }, { status: 400 });
  const used = await getDb().select({ id: transactions.id }).from(transactions).where(and(eq(transactions.userId, uid), eq(transactions.accountId, id))).limit(1);
  if (used.length) return Response.json({ error: "账户已有流水，不能删除" }, { status: 409 });
  const deleted = await getDb().delete(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, uid))).returning({ id: accounts.id });
  return deleted.length ? Response.json({ ok: true }) : Response.json({ error: "账户不存在" }, { status: 404 });
}
