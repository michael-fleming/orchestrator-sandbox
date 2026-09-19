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
  { id: "globex", name: "Globex", email: "ops@globex.example", createdAt: "2026-08-15T08:00:00Z" },
];

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

/**
 * Filters customers by the supported query parameters:
 *  - id: exact match on the customer id
 *  - name: exact (case-insensitive) match on the customer name
 *  - q: case-insensitive substring match on id, name or email
 */
function queryCustomers(params) {
  const id = params.get("id");
  const name = params.get("name");
  const q = params.get("q");

  return customers.filter((customer) => {
    if (id && customer.id !== id) return false;
    if (name && customer.name.toLowerCase() !== name.toLowerCase()) return false;
    if (q) {
      const needle = q.toLowerCase();
      const haystack = [customer.id, customer.name, customer.email]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
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
      return send(res, 200, _.orderBy(orders, ["createdAt"], ["desc"]));
    }
    if (req.method === "GET" && url.pathname === "/customers") {
      const matches = queryCustomers(url.searchParams);
      return send(res, 200, _.orderBy(matches, ["name"], ["asc"]));
    }
    return send(res, 404, { error: "not found" });
  });
}

module.exports = { createApp, orders, customers };

