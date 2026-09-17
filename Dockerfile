# Build stage: install production dependencies with the lockfile
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY src ./src

# Runtime stage: a minimal base keeps OS package CVEs out of the scan, so findings come from
# the app's own dependencies. Swap for any Node 22 base your organization approves.
FROM cgr.dev/chainguard/node:latest
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["src/server.js"]
