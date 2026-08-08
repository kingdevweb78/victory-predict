FROM node:18-alpine
WORKDIR /app

# Add swap for low-memory builds (Render Free: 512MB)  
RUN fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile || true

RUN apk add --no-cache python3 make g++ git
COPY package.json ./
RUN npm install --legacy-peer-deps --production=false
COPY . .

# Skip CRA admin build on Render Free (too heavy) — admin runs locally
# The /admin route will serve the API, admin dashboard deploys separately if needed

RUN mkdir -p uploads backups logs session data

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"
CMD ["node", "server/index.js"]
