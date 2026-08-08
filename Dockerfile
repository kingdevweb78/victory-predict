FROM node:18-alpine
WORKDIR /app

RUN apk add --no-cache python3 make g++ git
COPY package.json ./
RUN npm install --legacy-peer-deps --production=false
COPY . .
RUN mkdir -p uploads backups logs session data

ENV PORT=10000
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 CMD node -e "require('http').get('http://localhost:10000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"
CMD ["node", "server/index.js"]
