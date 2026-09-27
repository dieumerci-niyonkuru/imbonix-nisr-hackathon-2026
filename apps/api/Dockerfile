# IMBONIX API. Build from the repository root, so the published data can be copied in:
#   docker build -f apps/api/Dockerfile -t imbonix-api .

FROM node:22-alpine AS deps
WORKDIR /app
COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000 \
    DATA_DIR=/app/data
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node apps/api/package.json ./
COPY --chown=node:node apps/api/src ./src
# The same published aggregates the website is built from.
COPY --chown=node:node apps/web/src/data/generated/districts.json apps/web/src/data/generated/sectors.json ./data/
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "src/server.js"]
