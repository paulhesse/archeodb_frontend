# Build stage
FROM node:20 AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using --legacy-peer-deps to handle tailwind-scrollbar dependency conflict
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config to handle SPA routing if needed
# For now, standard config is fine as there's no complex routing
# If you add react-router, you'll need a custom nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
