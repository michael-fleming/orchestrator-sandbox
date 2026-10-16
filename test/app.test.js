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

test("lists customers sorted by name", async () => {
  const body = await (await fetch(`${base}/customers`)).json();
  assert.deepStrictEqual(body.map((c) => c.id), ["acme", "globex"]);
});

test("filters customers by search term", async () => {
  const body = await (await fetch(`${base}/customers?q=globe`)).json();
  assert.deepStrictEqual(body.map((c) => c.id), ["globex"]);
});

test("filters customers by id and country", async () => {
  const byId = await (await fetch(`${base}/customers?id=acme`)).json();
  assert.deepStrictEqual(byId.map((c) => c.id), ["acme"]);

  const byCountry = await (await fetch(`${base}/customers?country=gb`)).json();
  assert.deepStrictEqual(byCountry.map((c) => c.id), ["globex"]);

  const none = await (await fetch(`${base}/customers?id=acme&country=gb`)).json();
  assert.deepStrictEqual(none, []);
});

