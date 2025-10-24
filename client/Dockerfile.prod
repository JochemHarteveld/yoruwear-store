### Client multi-stage build: build Angular app with Node, serve with nginx
FROM node:20-alpine AS builder
WORKDIR /app

# copy package manifests first for better caching
COPY package.json package-lock.json ./
COPY . ./

RUN npm ci --no-audit --no-fund

# build production assets
RUN npm run build -- --configuration production || npm run build

FROM nginx:stable-alpine
# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Angular builds to `dist/<projectName>`; this project is named `client` so copy that folder
## Angular produces an SSR and a `browser` folder for client assets. Copy browser assets.
COPY --from=builder /app/dist/client/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD wget -qO- --timeout=3 http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
