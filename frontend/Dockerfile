# =========================
# Build stage
# =========================
FROM node:20 AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# 🔴 REQUIRED: inject backend URL at BUILD TIME
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Build the Vite app
RUN npm run build


# =========================
# Runtime stage (nginx)
# =========================
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run default port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
