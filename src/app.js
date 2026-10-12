const http = require("node:http");

/** In-memory orders store; good enough for a sandbox. */
const orders = [
  { id: "1001", customer: "acme", total: 42.5, createdAt: "2026-09-01T10:00:00Z" },
  { id: "1002", customer: "globex", total: 18.0, createdAt: "2026-09-02T09:30:00Z" },
];

/** In-memory customers store; good enough for a sandbox. */
const customers = [
  { id: "acme", name: "Acme Corp", email: "ops@acme.example", createdAt: "2026-08-01T08:00:00Z" },
  { id: "globex", name: "Globex Inc", email: "billing@globex.example", createdAt: "2026-08-15T08:00:00Z" },
];

/** Minimal stable sort helper (replaces lodash.orderBy). */
function sortBy(items, key, direction = "asc") {
  const sign = direction === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    if (a[key] === b[key]) return 0;
    return (a[key] > b[key] ? 1 : -1) * sign;
  });
}

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

/**
 * Filter customers by the supported query parameters:
 * - id: exact match (case-insensitive)
 * - name / email: substring match (case-insensitive)
 * - q: substring match against id, name or email (case-insensitive)
 */
function queryCustomers(params) {
  const lower = (value) => String(value ?? "").toLowerCase();
  const id = params.get("id");
  const name = params.get("name");
  const email = params.get("email");
  const q = params.get("q");

  return customers.filter((customer) => {
    if (id && lower(customer.id) !== lower(id)) return false;
    if (name && !lower(customer.name).includes(lower(name))) return false;
    if (email && !lower(customer.email).includes(lower(email))) return false;
    if (q) {
      const needle = lower(q);
      const haystack = [customer.id, customer.name, customer.email].map(lower);
      if (!haystack.some((value) => value.includes(needle))) return false;
    }
    return true;
  });
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
      const matches = queryCustomers(url.searchParams);
      return send(res, 200, sortBy(matches, "name", "asc"));
    }
    return send(res, 404, { error: "not found" });
  });
}

module.exports = { createApp, orders, customers };

