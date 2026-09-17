const http = require("node:http");
const _ = require("lodash");

/** In-memory orders store; good enough for a sandbox. */
const orders = [
  { id: "1001", customer: "acme", total: 42.5, createdAt: "2026-09-01T10:00:00Z" },
  { id: "1002", customer: "globex", total: 18.0, createdAt: "2026-09-02T09:30:00Z" },
];

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
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
    const match = url.pathname.match(/^\/orders\/([\w-]+)$/);
    if (req.method === "GET" && match) {
      const order = _.find(orders, { id: match[1] });
      return order ? send(res, 200, order) : send(res, 404, { error: `order ${match[1]} not found` });
    }
    return send(res, 404, { error: "not found" });
  });
}

module.exports = { createApp, orders };
