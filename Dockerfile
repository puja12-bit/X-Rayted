# ---------- Build stage ----------
FROM node:18-alpine AS build

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build frontend
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your new nginx config (Must exist in the same folder as Dockerfile)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# CHANGE THIS TO 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
