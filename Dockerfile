# Build stage: install production dependencies with the lockfile
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY src ./src

# Runtime stage: a minimal base keeps OS package CVEs out of the scan, so findings come from
# the app's own dependencies. The -dev variant is used only so the bundled npm CLI can be
# deleted; the application is started directly with node and never needs a package manager.
FROM cgr.dev/chainguard/node:latest-dev AS runtime
USER root
# Drop the npm CLI and its vendored dependency tree (source of GHSA-ch52-4w7c-c8xp in
# http-cache-semantics, which has no upstream fix) from the shipped image.
RUN rm -rf /usr/lib/node_modules/npm /usr/local/lib/node_modules/npm \
           /usr/bin/npm /usr/bin/npx /usr/local/bin/npm /usr/local/bin/npx
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
USER 65532
ENTRYPOINT ["node"]
CMD ["src/server.js"]

