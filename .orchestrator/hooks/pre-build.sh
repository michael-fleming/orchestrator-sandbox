#!/usr/bin/env bash
# Runs before the image build when the build workflow uses hooks mode.
# Put repo-specific steps here (code generation, asset downloads, ...).
set -euo pipefail
echo "pre-build hook: nothing to do for orders-api"
