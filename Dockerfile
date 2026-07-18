# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies before copying source to improve build caching
COPY package.json package-lock.json ./
RUN npm ci

# Build the production application
COPY . .
RUN npm run build


# Stage 2: Serve the production build with Nginx
FROM nginx:alpine

# Hugging Face Docker Spaces exposes one public application port.
ENV PORT=7860

# Run safely as the non-root user recommended for Docker Spaces.
RUN adduser -D -u 1000 user \
    && chown -R user:user /var/cache/nginx /var/run /var/log/nginx /etc/nginx /usr/share/nginx/html

# Copy the built React app and Nginx template.
COPY --from=builder --chown=user:user /app/dist /usr/share/nginx/html
COPY --chown=user:user nginx.conf /etc/nginx/templates/default.conf.template

USER user

EXPOSE 7860

CMD ["nginx", "-g", "daemon off;"]
