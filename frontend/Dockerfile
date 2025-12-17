# ---------- Build stage ----------
FROM node:18-alpine AS build

WORKDIR /app

# Install deps first (better caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build frontend (Vite -> dist/)
RUN npm run build


# ---------- Runtime stage ----------
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

