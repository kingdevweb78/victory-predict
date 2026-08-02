FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++ git
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN if [ -d "client/admin" ]; then cd client/admin && npm install && npm run build; fi
RUN npm prune --production
RUN mkdir -p uploads backups logs session
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"
CMD ["node", "server/index.js"]