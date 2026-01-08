# Stage 1: Build the Angular app
FROM node:20-alpine AS build
WORKDIR /app

# Install git to get commit hash
RUN apk add --no-cache git

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

# Generate version file with git hash
RUN echo "export const BUILD_HASH = '$(git rev-parse --short HEAD || echo "unknown")';" > src/app/build-hash.ts

RUN yarn build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
