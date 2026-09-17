# Scripted coder change sets

The orchestrator's scripted coder (a stand-in for an AI coding agent) applies one change set per
pass through development, in name order:

| Change set | When | What it does |
|---|---|---|
| `01-order-lookup` | first pass | Adds `GET /orders/:id` and tests. Leaves lodash at 4.17.20, which has a known high-severity CVE, so the scan sends the work back. |
| `02-upgrade-lodash` | rework cycle 1 | Upgrades lodash to 4.17.21, which fixes it. |

Each directory mirrors repo paths; files are written as-is. An optional `_delete.txt` lists
paths to delete, one per line. Files in this README's directory itself are ignored.
