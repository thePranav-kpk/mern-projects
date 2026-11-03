# MERN Projects Monorepo 🚀

A collection of 5 production-grade full-stack web applications built using the **MERN Stack** (MongoDB, Express, React, Node.js). Each application is architected for decoupled cloud deployment: **Vercel** for the high-performance React frontends, and **Render** for the scalable Express backends, kept active 24/7 via automated health check cron jobs.

---

## 🌐 Live Deployments & Status

| Application | Frontend (Vercel) | Backend API (Render) | Health Check (Keep-Alive) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Expense Tracker** | [Live App](https://mern-projects-omega-ashen.vercel.app/login) | [API Service](https://expense-tracker-api-a6fu.onrender.com) | [`/api/health`](https://expense-tracker-api-a6fu.onrender.com/api/health) | 🟢 **Live** |
| **To-Do App** | *Pending Deployment* | *Pending Deployment* | `/api/health` | 🟡 Ready |
| **URL Shortener** | *Pending Deployment* | *Pending Deployment* | `/api/health` | 🟡 Ready |
| **Notes App** | *Pending Deployment* | *Pending Deployment* | `/api/health` | 🟡 Ready |
| **Real-Time Chat App** | *Pending Deployment* | *Pending Deployment* | `/api/health` | 🟡 Ready |

---

## 🏛️ Cloud Architecture Pattern

Each project follows an enterprise decoupled cloud architecture:

```
┌───────────────────────────────────────┐            ┌────────────────────────────────────────┐
│            Vercel (Frontend)          │   HTTPS    │             Render (Backend)           │
│  - React 19 / Vite SPA                │ ─────────> │  - Express 5 / Node.js API             │
│  - Edge CDN Distribution              │  REST/JWT  │  - MongoDB Atlas Cloud Database        │
│  - vercel.json SPA Route Rewrites     │  WebSocket │  - Health check endpoint: /api/health  │
│  - Centralized VITE_API_URL Config    │            │  - render.yaml Blueprint Support       │
└───────────────────────────────────────┘            └────────────────────────────────────────┘
                                                                  ▲
                                                                  │ Ping every 10–14 min
                                                     ┌────────────┴───────────────────────────┐
                                                     │        Keep-Alive Cron Job             │
                                                     │  (cron-job.org / GitHub Actions)       │
                                                     │  Prevents Render free-tier spin-down   │
                                                     └────────────────────────────────────────┘
```

---

## 📦 Projects Directory

### 1. [Expense Tracker & Financial Analytics](./expense-tracker/README.md)
*   **Live App**: [https://mern-projects-omega-ashen.vercel.app](https://mern-projects-omega-ashen.vercel.app)
*   **Tech**: React 19, Express 5, MongoDB Aggregation Pipelines (`$match`, `$group`), JWT, Docker.
*   **Highlights**: Real-time balance calculations, category-wise breakdown aggregations, atomic `useReducer` state management.

### 2. [Task & To-Do Management](./to-do-app/README.md)
*   **Tech**: React, Express, MongoDB, RESTful CRUD, Docker.
*   **Highlights**: Optimistic UI updates, task filtering, clean responsive design.

### 3. [TrimURL - URL Shortener & Analytics](./url-shortener/README.md)
*   **Tech**: React 19, TypeScript, Express, Nanoid, MongoDB, QR Code generation.
*   **Highlights**: Instant URL redirection with click-through analytics tracking and QR code download.

### 4. [Notes Workspace & Knowledge Base](./notes-app/README.md)
*   **Tech**: React, Express, MongoDB, JWT Auth, Docker Compose.
*   **Highlights**: Rich Markdown formatting, tag categorization, secure user session management.

### 5. [Real-Time WebSocket Chat Application](./chat-app/README.md)
*   **Tech**: React, Socket.IO, Express, Express-Session, MongoDB Connect-Mongo, Nginx.
*   **Highlights**: Bi-directional real-time messaging, typing indicators, room management, session authentication over WebSockets.

---

## ⏰ Keeping Render Backends Active 24/7

Render's free tier spins down services after 15 minutes of inactivity. To keep them awake without delay:

1. Create a free account at [cron-job.org](https://cron-job.org/).
2. Create a cron job pointing to the health check endpoint of each backend:
   ```
   https://<your-service>.onrender.com/api/health
   ```
3. Set the schedule to run **Every 10 minutes** or **Every 14 minutes**.
4. The service will respond with `{ "status": "ok", "service": "...", "timestamp": "..." }` and remain active 24/7.

