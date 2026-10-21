const { test, before, after } = require("node:test");
const assert = require("node:assert");
const { createApp } = require("../src/app");

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test("health check", async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: "ok" });
});

test("lists orders newest first", async () => {
  const body = await (await fetch(`${base}/orders`)).json();
  assert.deepStrictEqual(body.map((o) => o.id), ["1002", "1001"]);
});

test("lists customers by name", async () => {
  const res = await fetch(`${base}/customers`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.deepStrictEqual(body.map((c) => c.id), ["acme", "globex"]);
});

test("queries customers by id", async () => {
  const body = await (await fetch(`${base}/customers?id=globex`)).json();
  assert.deepStrictEqual(body.map((c) => c.id), ["globex"]);
});

test("queries customers by free text", async () => {
  const body = await (await fetch(`${base}/customers?q=acme.example`)).json();
  assert.deepStrictEqual(body.map((c) => c.id), ["acme"]);

  const none = await (await fetch(`${base}/customers?q=nobody`)).json();
  assert.deepStrictEqual(none, []);
});

