FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 🔴 ADD THESE TWO LINES
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build
