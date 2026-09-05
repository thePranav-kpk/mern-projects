# MERN Notes App (with JWT Authentication)

*   **Live Application**: [https://notes-app-jkhe.onrender.com](https://notes-app-jkhe.onrender.com)
*   **Live API Endpoint**: [https://notes-app-jkhe.onrender.com/api/v1/notes](https://notes-app-jkhe.onrender.com/api/v1/notes) (Requires Authentication)

A secure, multi-user Notes application built using the MERN stack (MongoDB, Express 5, React 19, Node.js). This project implements password hashing, token-based session persistence, custom route guards, and a glassmorphism dark-theme dashboard with category tagging, color customizers, and pin-to-top sorting.

---

## 🚀 Tech Stack

*   **Frontend**: React 19, React Router Dom, JavaScript, Vanilla CSS (Custom properties, Glassmorphic variables)
*   **Backend**: Node.js, Express 5 (RegExp routing, custom middlewares)
*   **Database**: MongoDB Atlas, Mongoose ODM
*   **Authentication**: JSON Web Tokens (JWT), `bcryptjs` password hashing
*   **Containerization**: Docker Compose (separate backend + Nginx frontend containers)

---

## 📁 Folder Structure

```text
notes-app/
├── backend/
│   ├── controllers/          # auth.js (register/login) & notes.js (CRUD)
│   ├── db/                   # Database connect.js file
│   ├── errors/               # CustomAPIError class
│   ├── middleware/           # async.js, error-handler.js, not-found.js, auth.js (JWT guard)
│   ├── models/               # User.js (User schema) & Note.js (Note schema)
│   ├── routes/               # Express auth & notes route mappings
│   ├── .env                  # Environment configurations (local only)
│   ├── Dockerfile            # Backend-only Node.js container
│   ├── package.json          # Node scripts & dependencies
│   └── server.js             # Express application entry point (serves compiled static frontend)
├── frontend/
│   ├── src/
│   │   ├── components/       # ProtectedRoute, Navbar, NoteCard, AddEditNoteModal
│   │   ├── context/          # AuthContext (global state, auto-login, logout)
│   │   ├── pages/            # Login, Register, Dashboard
│   │   ├── App.css           # Global layout adjustments
│   │   ├── App.jsx           # Main routing tree
│   │   ├── index.css         # Custom dark glassmorphic variables and layouts
│   │   └── main.jsx
│   ├── Dockerfile            # Multi-stage: Vite build → Nginx serve
│   ├── nginx.conf            # Nginx config: SPA routing + /api reverse proxy to backend
│   ├── package.json          # Vite React scripts & configurations
│   └── vite.config.js        # Vite build tool config with dev server proxy
├── docker-compose.yml        # Orchestrates backend + frontend containers
├── .dockerignore             # Excludes node_modules, dist, .env from build context
└── README.md                 # Project documentation
```

---

## 🐳 Running with Docker Compose (Recommended)

This is the recommended way to run the application. Docker Compose spins up two isolated containers — the Express API backend and an Nginx frontend — connected over an internal network.

### Architecture
```
Browser → Nginx (port 80)
           ├── /          → serves React SPA (index.html + assets)
           └── /api/*     → reverse proxied to Express backend (port 5000)
```

### Prerequisites
Make sure you have [Docker](https://docs.docker.com/get-docker/) installed and a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string ready.

### 1. Create a `.env` file
Create a `.env` file in the `notes-app/` directory (same level as `docker-compose.yml`):
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/notes_db?retryWrites=true&w=majority
JWT_SECRET=yoursupersecurejwtsecretkey
```
> This file is excluded from both Git and the Docker build context by `.dockerignore`.

### 2. Build and Start
```bash
docker compose up --build
```
Docker will:
- Build the backend Node.js image
- Build the frontend (Vite → compile React, then Nginx serves the output)
- Connect both on an isolated internal network

Open your browser and navigate to `http://localhost`.

### 3. Stop the Containers
```bash
docker compose down
```

---

## 🐳 Pull from Docker Hub

Pre-built images are available on Docker Hub — no local build required:
```bash
docker pull pranav1306/mern-projects:notes-app-backend
docker pull pranav1306/mern-projects:notes-app-frontend
```
Then run with Compose (uses `image:` tags from `docker-compose.yml` to pull automatically):
```bash
docker compose up
```

---

## 🛠️ Installation & Local Setup (Without Docker)

Follow these steps if you prefer running the frontend and backend servers separately in development mode.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed and a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database set up.

### 1. Configure the Backend
1. Navigate to the `backend` directory:
   ```bash
   cd notes-app/backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your configurations:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/notes_db?retryWrites=true&w=majority
   JWT_SECRET=yoursupersecurejwtsecretkey
   ```

### 2. Configure the Frontend
1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd notes-app/frontend
   ```
2. Install the client dependencies:
   ```bash
   npm install
   ```

### Start the Backend
In the `backend/` directory terminal, run:
```bash
npm run dev
```
The server will start on port `5000` with the log:
```text
Connected to MongoDB successfully...
Server is running on port 5000
```

### Start the Frontend
In the `frontend/` directory terminal, run:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`. The Vite proxy will route all `/api` calls automatically to port 5000.

---

## 🔌 API Endpoint Documentation

### Authentication Routes

| HTTP Method | Route Endpoint | Description | Request Body Format | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Register a new user account | `{ "name": "...", "email": "...", "password": "..." }` | `201 Created` |
| **POST** | `/api/v1/auth/login` | Log in and receive a JWT token | `{ "email": "...", "password": "..." }` | `200 OK` |
| **GET** | `/api/v1/auth/me` | Fetch logged-in user profile | *Requires Header `Authorization: Bearer <TOKEN>`* | `200 OK` |

### Notes CRUD Routes (Requires Header: `Authorization: Bearer <TOKEN>`)

| HTTP Method | Route Endpoint | Description | Request Body Format | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/notes` | Fetch all notes belonging to the user | *None* | `200 OK` |
| **POST** | `/api/v1/notes` | Create a new note | `{ "title": "...", "content": "...", "tags": [...], "color": "..." }` | `201 Created` |
| **PATCH** | `/api/v1/notes/:id` | Update note details, pin status, or color | `{ "title": "...", "isPinned": true, "color": "..." }` | `200 OK` |
| **DELETE** | `/api/v1/notes/:id` | Delete a note by ID | *None* | `200 OK` |

---

## 🛠️ Advanced Architectures Implemented

### 1. Multi-Container Docker Compose Architecture
Instead of bundling the frontend into the backend image, this app uses Docker Compose to run two isolated containers:
- **Backend container**: Pure Express API — no static file serving, no frontend tooling
- **Frontend container**: Nginx serves the compiled React SPA and acts as a **reverse proxy**, forwarding all `/api/*` requests to the backend container over Docker's internal network. The browser only ever talks to port 80 — it never directly hits port 5000.

### 2. Nginx as Reverse Proxy (no CORS needed)
Since Nginx forwards `/api/` requests to the backend on the same Docker network, **both frontend and backend appear to be on the same origin** from the browser's perspective. This eliminates CORS entirely for the containerized deployment.

### 3. Multi-Tenant Database Isolation
To ensure strict separation of user data, every note includes a reference to its owner:
```javascript
userId: {
  type: mongoose.Types.ObjectId,
  ref: "User",
  required: true
}
```
All CRUD database actions filter by **both** the note `_id` and the verified JWT user ID (`req.user.userId`), preventing users from accessing or editing other users' notes.

### 4. React 19 Key-Based Component Resetting
Rather than utilizing side effects (`useEffect`) inside the `AddEditNoteModal` to reset inputs (which triggers cascading renders), the component is mounted inside the Dashboard using a unique **`key` prop**:
```jsx
<AddEditNoteModal
  key={noteToEdit ? noteToEdit._id : isModalOpen ? "open" : "closed"}
/>
```
This forces React to cleanly unmount the old modal and construct a new one, resetting states instantly with no rendering overhead.
