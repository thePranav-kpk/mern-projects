# Stage 1 - Build frontend
FROM node:20-alpine AS base

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm install

COPY ./frontend ./

RUN npm run build

# Stage 2 - Build backend
FROM node:20-alpine AS final

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm install

COPY ./backend ./

RUN npm run build

# Stage 3 - Run backend
FROM node:20-alpine AS run

WORKDIR /app/backend

COPY --from=final /app/backend/dist /app/backend/dist

COPY --from=final /app/backend/package*.json ./

RUN npm install --omit=dev

COPY --from=base /app/frontend/dist /app/frontend/dist

EXPOSE 5000

CMD ["node","dist/server.js"]