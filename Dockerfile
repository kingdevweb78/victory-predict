FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++ git
COPY package.json ./
RUN npm install --legacy-peer-deps --production=false
COPY . .
RUN if [ -d "client/admin" ] && [ -f "client/admin/package.json" ]; then cd client/admin && npm install --legacy-peer-deps 2>/dev/null; if grep -q '"build"' package.json 2>/dev/null; then npx vite build 2>/dev/null || npm run build 2>/dev/null || echo 'build skipped'; fi; fi
RUN mkdir -p uploads backups logs session data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"
CMD ["node", "server/index.js"]
