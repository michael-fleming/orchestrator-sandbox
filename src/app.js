const http = require("node:http");

/** In-memory orders store; good enough for a sandbox. */
const orders = [
  { id: "1001", customer: "acme", total: 42.5, createdAt: "2026-09-01T10:00:00Z" },
  { id: "1002", customer: "globex", total: 18.0, createdAt: "2026-09-02T09:30:00Z" },
];

/** In-memory customers store; good enough for a sandbox. */
const customers = [
  { id: "acme", name: "Acme Corp", email: "ops@acme.example" },
  { id: "globex", name: "Globex Inc", email: "ops@globex.example" },
];

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

/** Stable sort by a string key, ascending or descending. */
function sortBy(items, key, direction = "asc") {
  const factor = direction === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    if (a[key] === b[key]) return 0;
    return (a[key] < b[key] ? -1 : 1) * factor;
  });
}

/**
 * Filter customers by optional query params:
 *  - id: exact match on customer id
 *  - q:  case-insensitive substring match on name or email
 */
function queryCustomers(params) {
  const id = params.get("id");
  const q = params.get("q");

  let result = customers;

  if (id) {
    result = result.filter((c) => c.id === id);
  }
  if (q) {
    const needle = q.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle)
    );
  }

  return sortBy(result, "name", "asc");
}

function createApp() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === "/health") {
      return send(res, 200, { status: "ok" });
    }
    if (req.method === "GET" && url.pathname === "/orders") {
      return send(res, 200, sortBy(orders, "createdAt", "desc"));
    }
    if (req.method === "GET" && url.pathname === "/customers") {
      return send(res, 200, queryCustomers(url.searchParams));
    }
    return send(res, 404, { error: "not found" });
  });
}

module.exports = { createApp, orders, customers };

