# 1. Update Dockerfile to use 'npm install' instead of 'npm ci'
cat > Dockerfile <<EOF
# ---------- Build stage ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files (The * makes lockfile optional for the COPY step)
COPY package.json package-lock.json* ./

# USE NPM INSTALL (This works even if package-lock.json is missing)
RUN npm install

# Copy source
COPY . .

# Build frontend
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
EOF

# 2. Deploy again
gcloud run deploy xrayted --source . --region europe-west1 --allow-unauthenticated
