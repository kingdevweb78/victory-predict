FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++ git
COPY package.json ./
RUN npm install --legacy-peer-deps --production=false
COPY client/admin/package.json client/admin/package-lock.json client/admin/
COPY client/admin/vite.config.js client/admin/index.html client/admin/
RUN cd client/admin && npm ci --legacy-peer-deps 2>&1 | tail -5
COPY . .
RUN cd client/admin && npx vite build 2>&1 && echo "OK"
RUN mkdir -p uploads backups logs session data
ENV PORT=10000
ENV NODE_ENV=production
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD node -e "require('http').get('http://localhost:10000/health',(res)=>process.exit(res.statusCode===200?0:1))"
CMD ["node","server/index.js"]
