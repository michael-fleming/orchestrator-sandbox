const http = require("node:http");
const _ = require("lodash");

/** In-memory orders store; good enough for a sandbox. */
const orders = [
  { id: "1001", customer: "acme", total: 42.5, createdAt: "2026-09-01T10:00:00Z" },
  { id: "1002", customer: "globex", total: 18.0, createdAt: "2026-09-02T09:30:00Z" },
];

/** In-memory customers store; good enough for a sandbox. */
const customers = [
  { id: "acme", name: "Acme Corp", email: "ops@acme.example", createdAt: "2026-08-01T12:00:00Z" },
  { id: "globex", name: "Globex Inc", email: "hello@globex.example", createdAt: "2026-08-15T12:00:00Z" },
];

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

/**
 * Filters customers using the supported query parameters:
 *   id    - exact match on the customer id
 *   name  - case-insensitive substring match on the name
 *   email - case-insensitive substring match on the email
 *   q     - case-insensitive substring match on name or email
 */
function queryCustomers(params) {
  const id = params.get("id");
  const name = params.get("name");
  const email = params.get("email");
  const q = params.get("q");

  const contains = (value, needle) =>
    String(value ?? "").toLowerCase().includes(String(needle).toLowerCase());

  const matches = customers.filter((c) => {
    if (id && c.id !== id) return false;
    if (name && !contains(c.name, name)) return false;
    if (email && !contains(c.email, email)) return false;
    if (q && !contains(c.name, q) && !contains(c.email, q) && !contains(c.id, q)) return false;
    return true;
  });

  return _.orderBy(matches, [(c) => c.name.toLowerCase()], ["asc"]);
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

