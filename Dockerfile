# Build stage: install production dependencies with the lockfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY src ./src

# Runtime stage: the Alpine-based Node image is rebuilt against current OS packages, which
# removes the Debian 12 glibc/openssl/libstdc++ findings reported by the scanner, and tracks the
# latest Node 22 patch release (>= 22.23.2) for the Node runtime CVEs. `apk upgrade` pulls any
# package fixes published after the base image was built.
FROM node:22-alpine
RUN apk --no-cache upgrade
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
USER node
CMD ["node", "src/server.js"]

