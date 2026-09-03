import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("build emits the application route and installable assets", async () => {
  const serverManifest = JSON.parse(await readFile(new URL("../dist/server/.vite/manifest.json", import.meta.url), "utf8"));
  const clientManifest = JSON.parse(await readFile(new URL("../dist/client/.vite/manifest.json", import.meta.url), "utf8"));
  assert.ok(Object.keys(serverManifest).length > 0);
  assert.ok(Object.keys(clientManifest).length > 0);
  assert.equal(JSON.parse(await readFile(new URL("../dist/client/manifest.webmanifest", import.meta.url), "utf8")).display, "standalone");
});
