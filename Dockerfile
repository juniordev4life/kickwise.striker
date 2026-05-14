# Build stage: produce the SvelteKit static output
FROM node:24-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage: nginx (unprivileged, listens on 8080) with SPA fallback
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
