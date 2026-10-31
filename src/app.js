const http = require("node:http");
const _ = require("lodash");

/** In-memory orders store; good enough for a sandbox. */
const orders = [
  { id: "1001", customer: "acme", total: 42.5, createdAt: "2026-09-01T10:00:00Z" },
  { id: "1002", customer: "globex", total: 18.0, createdAt: "2026-09-02T09:30:00Z" },
];

/** In-memory customers store; good enough for a sandbox. */
const customers = [
  { id: "acme", name: "Acme Corp", country: "US" },
  { id: "globex", name: "Globex Inc", country: "DE" },
];

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

/** Filter customers by id (exact), name (substring) and country (exact); all case-insensitive. */
function queryCustomers(params) {
  const id = params.get("id");
  const name = params.get("name");
  const country = params.get("country");

  const matches = customers.filter((c) => {
    if (id && c.id.toLowerCase() !== id.toLowerCase()) return false;
    if (name && !c.name.toLowerCase().includes(name.toLowerCase())) return false;
    if (country && c.country.toLowerCase() !== country.toLowerCase()) return false;
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

