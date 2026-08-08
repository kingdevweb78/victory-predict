FROM node:18-alpine
WORKDIR /app

RUN apk add --no-cache python3 make g++ git

# Install root deps
COPY package.json ./
RUN npm install --legacy-peer-deps --production=false

# Copy admin config first, then install
COPY client/admin/package.json client/admin/
COPY client/admin/vite.config.js client/admin/index.html client/admin/
RUN cd client/admin && npm install --legacy-peer-deps 2>&1 | tail -3

# Copy everything else
COPY . .

# Build admin dashboard
RUN cd client/admin && npx vite build 2>&1 && echo "✅ Admin build DONE"

RUN mkdir -p uploads backups logs session data

ENV PORT=10000
ENV NODE_ENV=production
EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 CMD node -e "require('http').get('http://localhost:10000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"
CMD ["node", "server/index.js"]
