# Build stage: install production dependencies with the lockfile
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY src ./src

# Runtime stage: a minimal base keeps OS package CVEs out of the scan, so findings come from
# the app's own dependencies. The -dev variant is used only so the bundled package managers can
# be removed; the application is started directly with node and never needs a package manager.
FROM cgr.dev/chainguard/node:latest-dev AS runtime
USER root
# Remove the pnpm OS package, which has no upstream fix for CVE-2026-82393, CVE-2026-82392 and
# CVE-2026-101043. Uninstalling it via apk also drops it from the apk database the scanner reads.
RUN apk del pnpm-11.8 pnpm 2>/dev/null || true
# Pick up any patched OS packages that are available.
RUN apk --no-cache upgrade || true
# Drop the npm CLI and its vendored dependency tree (source of GHSA-ch52-4w7c-c8xp in
# http-cache-semantics, which has no upstream fix) plus any leftover pnpm files from the image.
RUN rm -rf /usr/lib/node_modules/npm /usr/local/lib/node_modules/npm \
           /usr/bin/npm /usr/bin/npx /usr/local/bin/npm /usr/local/bin/npx \
           /usr/lib/node_modules/pnpm /usr/local/lib/node_modules/pnpm \
           /usr/bin/pnpm /usr/bin/pnpx /usr/local/bin/pnpm /usr/local/bin/pnpx
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
USER 65532
ENTRYPOINT ["node"]
CMD ["src/server.js"]

