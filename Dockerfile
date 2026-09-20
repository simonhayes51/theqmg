FROM node:20

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY client/package*.json ./client/
RUN cd client && npm install --include=dev

COPY . .
RUN cd client && npm run build

ENV NODE_ENV=production
CMD ["node", "server/server.js"]
