# Stage 1: Build the React Application
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code and build
COPY . .
RUN npm run build


# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Cloud Run dynamically assigns a port to this variable. Default to 8080.
ENV PORT=8080

# Copy the built React app from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 1.19+ automatically processes templates in this directory and replaces ${PORT}
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Informational expose
EXPOSE 8080

# The default nginx command automatically runs the templates and starts the server
