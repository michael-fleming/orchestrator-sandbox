# Build stage: install production dependencies with the lockfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY src ./src

# Runtime stage: Alpine-based Node 22 image. The previous Debian 12 distroless base shipped an
# outdated Node runtime (22.22.0) plus libssl3/libc6/libstdc++ packages with no available fixes,
# which failed the vulnerability gate. The floating `22-alpine` tag resolves to the latest Node 22
# patch release (>= 22.23.2, which carries the HTTP/HTTP2 and permission-model fixes) on top of a
# current Alpine base, and `apk upgrade` pulls the newest OS package patches at build time.
# npm is removed from the runtime image because it bundles transitive packages with open advisories.
FROM node:22-alpine
RUN apk --no-cache upgrade \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
WORKDIR /app
COPY --from=build --chown=node:node /app /app
ENV NODE_ENV=production PORT=3000
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]

