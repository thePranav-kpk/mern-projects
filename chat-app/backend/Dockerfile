# Build stage
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . . 

RUN npm run build

# Run stage
FROM node:20-alpine

WORKDIR /app

COPY --from=base /app/package*.json ./

RUN npm install --omit=dev

COPY --from=base /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]