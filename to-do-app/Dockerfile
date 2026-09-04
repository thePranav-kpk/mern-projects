# Stage 1 - Build the frontend
FROM node:20-alpine AS base

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm install

COPY ./frontend ./

RUN npm run build

# Stage 2 - Run backend
FROM node:20-alpine AS final

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm install --omit=dev

COPY ./backend ./

COPY --from=base /app/frontend/dist /app/frontend/dist

EXPOSE 5000

CMD ["node","server.js"]