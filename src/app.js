const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const _ = require("lodash");

/** In-memory orders store; good enough for a sandbox. */
const orders = [
  { id: "1001", customer: "acme", total: 42.5, createdAt: "2026-09-01T10:00:00Z" },
  { id: "1002", customer: "globex", total: 18.0, createdAt: "2026-09-02T09:30:00Z" },
];

const INDEX_HTML_PATH = path.join(__dirname, "..", "public", "index.html");

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function sendIndex(res) {
  try {
    const html = fs.readFileSync(INDEX_HTML_PATH);
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(html);
  } catch {
    return send(res, 404, { error: "not found" });
  }
}

function createApp() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return sendIndex(res);
    }
    if (req.method === "GET" && url.pathname === "/health") {
      return send(res, 200, { status: "ok" });
    }
    if (req.method === "GET" && url.pathname === "/orders") {
      return send(res, 200, _.orderBy(orders, ["createdAt"], ["desc"]));
    }
    return send(res, 404, { error: "not found" });
  });
}

module.exports = { createApp, orders };

