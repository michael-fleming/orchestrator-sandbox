# Build stage: install production dependencies with the lockfile
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY src ./src

# Runtime stage: a minimal base keeps OS package CVEs out of the scan, so findings come from
# the app's own dependencies. Distroless ships node without a bundled npm, which keeps npm's
# own vendored dependencies (and their unfixed advisories) out of the image.
FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["src/server.js"]

