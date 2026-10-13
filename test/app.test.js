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

test("lists customers newest first", async () => {
  const res = await fetch(`${base}/customers`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.deepStrictEqual(body.map((c) => c.id), ["initech", "globex", "acme"]);
});

test("filters customers by id", async () => {
  const body = await (await fetch(`${base}/customers?id=acme`)).json();
  assert.deepStrictEqual(body.map((c) => c.id), ["acme"]);
});

test("searches customers by free text", async () => {
  const body = await (await fetch(`${base}/customers?q=globex`)).json();
  assert.deepStrictEqual(body.map((c) => c.id), ["globex"]);
});

test("sorts customers by name ascending", async () => {
  const body = await (await fetch(`${base}/customers?sort=name&order=asc`)).json();
  assert.deepStrictEqual(body.map((c) => c.name), ["Acme Corp", "Globex Inc", "Initech"]);
});

