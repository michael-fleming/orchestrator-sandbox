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
  { id: "globex", name: "Globex Corporation", country: "DE" },
];

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function queryCustomers(params) {
  const id = params.get("id");
  const country = params.get("country");
  const q = params.get("q");

  let result = customers;

  if (id) {
    result = result.filter((c) => c.id.toLowerCase() === id.toLowerCase());
  }
  if (country) {
    result = result.filter((c) => c.country.toLowerCase() === country.toLowerCase());
  }
  if (q) {
    const needle = q.toLowerCase();
    result = result.filter(
      (c) => c.id.toLowerCase().includes(needle) || c.name.toLowerCase().includes(needle)
    );
  }

  return _.orderBy(result, ["name"], ["asc"]);
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

