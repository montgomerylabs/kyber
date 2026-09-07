FROM node:22-bookworm-slim AS build
WORKDIR /app

# Build tools are devDependencies, so install them even in CI production environments.
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

# KYBER is prerendered; only public output belongs in the runtime image.
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/client /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
