const http = require("node:http");
const _ = require("lodash");

/** In-memory orders store; good enough for a sandbox. */
const orders = [
  { id: "1001", customer: "acme", total: 42.5, createdAt: "2026-09-01T10:00:00Z" },
  { id: "1002", customer: "globex", total: 18.0, createdAt: "2026-09-02T09:30:00Z" },
];

/** In-memory customers store; good enough for a sandbox. */
const customers = [
  { id: "acme", name: "Acme Corp", email: "ops@acme.example", createdAt: "2026-08-01T08:00:00Z" },
  { id: "globex", name: "Globex Inc", email: "ops@globex.example", createdAt: "2026-08-15T08:00:00Z" },
];

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

/**
 * Query the customers store.
 * Supported params: `id`, `name` (case-insensitive substring), `q` (matches id, name or email),
 * and `limit` (positive integer).
 */
function queryCustomers(params) {
  const id = params.get("id");
  const name = params.get("name");
  const q = params.get("q");
  const limitRaw = params.get("limit");

  let result = customers;

  if (id) {
    result = result.filter((c) => c.id.toLowerCase() === id.toLowerCase());
  }
  if (name) {
    const needle = name.toLowerCase();
    result = result.filter((c) => c.name.toLowerCase().includes(needle));
  }
  if (q) {
    const needle = q.toLowerCase();
    result = result.filter((c) =>
      [c.id, c.name, c.email].some((field) => String(field).toLowerCase().includes(needle))
    );
  }

  result = _.orderBy(result, ["name"], ["asc"]);

  const limit = Number(limitRaw);
  if (limitRaw !== null && Number.isInteger(limit) && limit >= 0) {
    result = result.slice(0, limit);
  }

  return result;
}

function createApp() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === "/health") {
      return send(res, 200, { status: "ok" });
    }
    if (req.method === "GET" && url.pathname === "/orders") {
      return send(res, 200, _.orderBy(orders, ["createdAt"], ["desc"]));
    }
    if (req.method === "GET" && url.pathname === "/customers") {
      return send(res, 200, queryCustomers(url.searchParams));
    }
    return send(res, 404, { error: "not found" });
  });
}

module.exports = { createApp, orders, customers };

