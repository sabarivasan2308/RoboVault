# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Cache and install dependencies deterministically
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy frontend source and compile static production bundle
COPY . ./
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check using Alpine BusyBox wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
