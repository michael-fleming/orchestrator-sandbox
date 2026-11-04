# orders-api (orchestrator sandbox)

A deliberately small Node service for exercising the agent orchestrator end to end:
real PRs, GitHub Actions builds, and Grype scans.

- `GET /health`, `GET /orders` (and `GET /orders/:id` once the first change set is applied)
- `GET /customers` — query customers with `id`, `name`, `q` (matches id, name or email) and `limit`
- Tests: `npm test` (Node's built-in test runner)
- Container: `docker build -t orders-api .`

**Intentionally vulnerable:** lodash was pinned to 4.17.20, which has a known high-severity CVE fixed
in 4.17.21; it is now pinned to 4.18.1. The first orchestrator run should fail the scan and send the
work back for rework.

`.orchestrator/test-changes/` holds the scripted coder's change sets (see `.orchestrator/CHANGE-SETS.md`).
`.github/workflows/orchestrator-*.yml` are thin callers of the shared `ci-templates` workflows.

