# RealChat: Real-Time Chat Application (Full-Stack TypeScript)

*   **Live Application**: [https://mern-projects-three-flame.vercel.app](https://mern-projects-three-flame.vercel.app)
*   **Live API Endpoint**: [https://mern-projects-5uwr.onrender.com/api/auth/me](https://mern-projects-5uwr.onrender.com/api/auth/me) (Requires Session Authentication)

A full-stack real-time chat application built using Node.js, Express 5, React 19, TypeScript, Socket.io, and MongoDB. This project implements WebSocket-based messaging with room broadcasting, session-based authentication persisted in MongoDB via `connect-mongo`, cross-origin cookie negotiation, and live presence tracking (typing indicators, online user lists, edit/delete message events).

---

## 🚀 Tech Stack

*   **Frontend**: React 19, TypeScript (`.tsx`), Tailwind CSS v4, React Router Dom v7, `socket.io-client`, `lucide-react`
*   **Backend**: Node.js, Express 5, TypeScript (`.ts`), `tsx` (dev), `socket.io`, `express-session`, `connect-mongo`, `bcryptjs`, `cors`
*   **Database**: MongoDB Atlas, Mongoose ODM with TypeScript Interface definitions
*   **Auth**: Session-based authentication (cookie + MongoStore), `bcryptjs` password hashing
*   **Deployment**: Frontend → Vercel, Backend → Render

---

## 📁 Folder Structure

```text
chat-app/
├── backend/
│   ├── src/
│   │   ├── config/          # db.ts (Mongoose connection helper)
│   │   ├── controllers/     # auth.ts (register/login/logout/me), message.ts (fetch by room)
│   │   ├── middleware/      # socketAuth.ts (session wrapper + handshake guard)
│   │   ├── models/          # User.ts, Message.ts (Mongoose schemas + TS interfaces)
│   │   ├── routes/          # auth.ts, message.ts (Express route mappings)
│   │   ├── sockets/         # chatHandler.ts (join_room, send/edit/delete/typing events)
│   │   ├── types/           # TypeScript type declarations
│   │   └── server.ts        # Express + HTTP Server + Socket.io entry point
│   ├── tsconfig.json        # TypeScript compiler configuration (module: Node16)
│   └── package.json         # Node scripts & TS dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # ProtectedRoute.tsx
│   │   ├── context/         # AuthContext.tsx (session state), SocketContext.tsx (socket lifecycle)
│   │   ├── pages/           # Login.tsx, Register.tsx, ChatRoom.tsx
│   │   ├── App.tsx          # React Router tree & Context providers
│   │   ├── index.css        # Tailwind v4 import & global resets
│   │   └── main.tsx
│   ├── vercel.json          # SPA rewrite rule for React Router
│   ├── tsconfig.json        # Frontend TypeScript compiler configuration
│   ├── package.json         # Vite React TS scripts & dependencies
│   └── vite.config.ts       # Vite config with dev proxy (/api, /socket.io → port 5000)
└── README.md                # Project documentation
```

---

## 🛠️ Installation & Local Setup

Follow these steps to run both the frontend and backend TypeScript servers simultaneously on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed and a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database set up.

### 1. Configure the Backend
1. Navigate to the `backend` directory:
   ```bash
   cd chat-app/backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your configurations:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/chat_db?retryWrites=true&w=majority
   SESSION_SECRET=your_super_secret_session_key
   FRONTEND_URL=http://localhost:5173
   ```

### 2. Configure the Frontend
1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd chat-app/frontend
   ```
2. Install the client dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory and add:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

---

## ⚡ Running the Application Locally (Development)

For the application to function, **both servers must run at the same time.**

### Start the Backend
In the `backend/` directory terminal, run:
```bash
npm run dev
```
`tsx` will start on port `5000` with hot-reloading:
```text
Connected to MongoDB successfully...
Server is listening on port 5000...
```

### Start the Frontend
In the `frontend/` directory terminal, run:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`. The Vite proxy forwards all `/api` and `/socket.io` traffic automatically to port 5000.

---

## 🔌 API Endpoint Documentation

### Auth Routes — `/api/auth`

| HTTP Method | Route Endpoint | Description | Request Body | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user | `{ "name": "String", "email": "String", "password": "String" }` | `201 Created` |
| **POST** | `/api/auth/login` | Login & create session | `{ "email": "String", "password": "String" }` | `200 OK` |
| **POST** | `/api/auth/logout` | Destroy session & clear cookie | *None* | `200 OK` |
| **GET** | `/api/auth/me` | Return session user data | *None (session cookie)* | `200 OK` |

### Message Routes — `/api/messages`

| HTTP Method | Route Endpoint | Description | Request Body | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/messages/:room` | Fetch all messages for a room | *None* | `200 OK` |

### Socket.io Events

| Direction | Event | Payload | Description |
| :--- | :--- | :--- | :--- |
| Client → Server | `join_room` | `room: string` | Join a named chat room |
| Client → Server | `send_message` | `{ room, content }` | Broadcast a new message to the room |
| Client → Server | `edit_message` | `{ messageId, room, newContent }` | Edit an existing own message |
| Client → Server | `delete_message` | `{ messageId, room }` | Soft-delete an own message |
| Client → Server | `user_typing` | `{ _id, room, isTyping }` | Broadcast typing state to room |
| Server → Client | `receive_message` | `Message` object | New message received in room |
| Server → Client | `message_edited` | Updated `Message` object | A message was edited |
| Server → Client | `message_deleted` | Updated `Message` object | A message was soft-deleted |
| Server → Client | `typing` | `{ userName, isTyping }` | Another user's typing state |
| Server → Client | `room_users` | `{ room, onlineUsers[] }` | Updated online presence list |

---

## 🛠️ Advanced Architectures Implemented

### 1. Session Shared Between HTTP & WebSocket (`wrapSession`)
Express sessions live in HTTP middleware. Socket.io handshakes are not HTTP requests, so the session is unavailable by default. A `wrapSession` adapter wraps the Express session middleware into a Promise that Socket.io's `io.use()` can call during the WebSocket handshake:
```typescript
export const wrapSession = (middleware: RequestHandler) =>
  (socket: Socket, next: (err?: Error) => void) => {
    middleware(socket.request as Request, {} as Response, next as NextFunction);
  };
```

### 2. Cross-Origin Cookie Negotiation (`sameSite: "none"` + `secure: true`)
When the frontend (Vercel) and backend (Render) are on different domains, browsers block cookies by default. The session cookie is configured with `sameSite: "none"` (allows cross-site sending) paired with `secure: true` (HTTPS only — required by the browser when `sameSite: "none"` is set). `app.set("trust proxy", 1)` tells Express to trust Render's HTTPS reverse proxy headers.

### 3. Soft-Delete Message Pattern
Messages are never hard-deleted from the database. Instead, an `isDeleted: true` flag is set and the content is cleared. The frontend renders deleted messages as greyed-out italic placeholders, preserving conversation thread integrity while removing the content.

### 4. Typing Indicator with Auto-Clear Timeout
A debounced typing event system emits `user_typing` on each keystroke and auto-clears after 4 seconds of inactivity via a `setTimeout` ref — preventing stale "is typing" states if a user stops typing without pressing Enter.
