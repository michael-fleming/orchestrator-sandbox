const http = require("node:http");

/** In-memory orders store; good enough for a sandbox. */
const orders = [
  { id: "1001", customer: "acme", total: 42.5, createdAt: "2026-09-01T10:00:00Z" },
  { id: "1002", customer: "globex", total: 18.0, createdAt: "2026-09-02T09:30:00Z" },
];

/** In-memory customers store; good enough for a sandbox. */
const customers = [
  { id: "acme", name: "Acme Corp", email: "ops@acme.example", createdAt: "2026-08-01T12:00:00Z" },
  { id: "globex", name: "Globex Inc", email: "billing@globex.example", createdAt: "2026-08-15T08:45:00Z" },
  { id: "initech", name: "Initech", email: "hello@initech.example", createdAt: "2026-08-20T16:20:00Z" },
];

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

/** Return a copy of `items` sorted by `key` in the given order ("asc" or "desc"). */
function orderBy(items, key, order) {
  const direction = order === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const left = a[key];
    const right = b[key];
    if (left < right) return -direction;
    if (left > right) return direction;
    return 0;
  });
}

/**
 * Filter + sort the customers store from query string parameters.
 * Supported params: id, q (matches id, name or email), sort, order.
 */
function queryCustomers(params) {
  const id = params.get("id");
  const q = params.get("q");
  const sort = params.get("sort") ?? "createdAt";
  const order = params.get("order") === "asc" ? "asc" : "desc";

  let result = customers;

  if (id) {
    const wanted = id.toLowerCase();
    result = result.filter((c) => c.id.toLowerCase() === wanted);
  }

  if (q) {
    const needle = q.toLowerCase();
    result = result.filter((c) =>
      [c.id, c.name, c.email].some((field) => String(field).toLowerCase().includes(needle))
    );
  }

  const sortKey = ["id", "name", "email", "createdAt"].includes(sort) ? sort : "createdAt";
  return orderBy(result, sortKey, order);
}

function createApp() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === "/health") {
      return send(res, 200, { status: "ok" });
    }
    if (req.method === "GET" && url.pathname === "/orders") {
      return send(res, 200, orderBy(orders, "createdAt", "desc"));
    }
    if (req.method === "GET" && url.pathname === "/customers") {
      return send(res, 200, queryCustomers(url.searchParams));
    }
    return send(res, 404, { error: "not found" });
  });
}

module.exports = { createApp, orders, customers };

