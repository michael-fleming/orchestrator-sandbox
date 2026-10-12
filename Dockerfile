# Build stage: install production dependencies with the lockfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY src ./src

# Runtime stage: an Alpine base pulls the current Node 22 patch release (fixing the node binary
# advisories) and avoids the Debian 12 glibc/openssl/libstdc++ packages that the distroless base
# shipped, several of which have no fixed version available. `apk upgrade` picks up any package
# fixes published since the base tag was built, and npm is removed so its vendored dependencies
# stay out of the image and out of the scan.
FROM node:22-alpine
RUN apk upgrade --no-cache \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
USER node
CMD ["node", "src/server.js"]

