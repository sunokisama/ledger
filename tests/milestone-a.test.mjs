import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
test("PWA manifest and service worker expose install support", async () => {
  const manifest = JSON.parse(await readFile(new URL("public/manifest.webmanifest", root), "utf8"));
  const worker = await readFile(new URL("public/sw.js", root), "utf8");
  assert.equal(manifest.display, "standalone");
  assert.match(worker, /addEventListener\("fetch"/);
});

test("account and transaction persistence is user scoped", async () => {
  const accountRoute = await readFile(new URL("app/api/accounts/route.ts", root), "utf8");
  const transactionRoute = await readFile(new URL("app/api/transactions/route.ts", root), "utf8");
  assert.match(accountRoute, /eq\(accounts\.userId, uid\)/);
  assert.match(accountRoute, /eq\(transactions\.userId, uid\)/);
  assert.match(transactionRoute, /eq\(accounts\.userId, uid\)/);
  assert.match(transactionRoute, /eq\(transactions\.userId, uid\)/);
  assert.match(transactionRoute, /account\.currency !== currency/);
});
