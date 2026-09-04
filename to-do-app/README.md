# MERN Task Manager (Todo App)

*   **Live Application**: [https://todo-app-sm1n.onrender.com](https://todo-app-sm1n.onrender.com)
*   **Live API Endpoint**: [https://todo-backend-whej.onrender.com/api/v1/todos](https://todo-backend-whej.onrender.com/api/v1/todos)


A modern, responsive Todo application built using the MERN stack (MongoDB, Express, React, Node.js). This project implements a fully decoupled client-server architecture with a development proxy, custom error classes, clean route-controller separations, and dynamic state synchronization.

---

## 🚀 Tech Stack

*   **Frontend**: React (Vite template), JavaScript, Vanilla CSS (Variables, Flexbox, Transitions)
*   **Backend**: Node.js, Express.js (Router, middleware architectures)
*   **Database**: MongoDB Atlas, Mongoose ODM
*   **Utilities**: `http-status-codes`, `dotenv`, `cors`, `nodemon`
*   **Containerization**: Docker (multi-stage build — Vite build → Node.js serve)

---

## 📁 Folder Structure

```text
to-do-app/
├── backend/
│   ├── config/               # Database connect functions
│   ├── controllers/          # Endpoint business logic
│   ├── errors/               # CustomAPIError class
│   ├── middleware/           # asyncWrapper, error-handler, not-found
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express route mappings
│   ├── .env                  # Environment configurations (local only)
│   ├── package.json          # Node scripts & dependencies
│   └── server.js             # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/       # TodoForm, TodoList, TodoItem
│   │   ├── App.css           # Premium glassmorphic dark theme styles
│   │   ├── App.jsx           # Main API fetching & state coordinator
│   │   ├── index.css         # Global variables & font registers
│   │   └── main.jsx
│   ├── package.json          # Vite React scripts & configurations
│   └── vite.config.js        # Vite build tool config with dev server proxy
├── Dockerfile                # Multi-stage Docker build
├── .dockerignore             # Excludes node_modules, dist, .env from build context
└── README.md                 # Project documentation
```

---

## 🐳 Running with Docker (Recommended)

This is the recommended way to run the application locally. Docker builds the frontend, bundles it into the backend image, and runs everything as a single container — no need to manage two separate servers.

### Prerequisites
Make sure you have [Docker](https://docs.docker.com/get-docker/) installed and a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string ready.

### 1. Build the Docker Image
From the `to-do-app/` directory:
```bash
docker build -t todo-app .
```
Docker will:
- Install frontend dependencies and run `vite build`
- Install backend production dependencies (no devDependencies)
- Copy the compiled React assets into the backend image
- Produce a lean, production-ready image

### 2. Run the Container
```bash
docker run -p 5000:5000 \
  -e MONGO_URI="mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority" \
  todo-app
```
Open your browser and navigate to `http://localhost:5000`.

> **Note**: The `-e` flag injects environment variables at runtime. Never bake secrets into the image itself.

---

## 🛠️ Installation & Local Setup (Without Docker)

Follow these steps if you prefer running the frontend and backend servers separately in development mode.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed and a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database set up.

### 1. Configure the Backend
1. Navigate to the `backend` directory:
   ```bash
   cd to-do-app/backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your configurations:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority
   ```

### 2. Configure the Frontend
1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd to-do-app/frontend
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
The server will start on port `5000` with the logs:
```text
Connected to MongoDB successfully...
Server is listening on port 5000...
```

### Start the Frontend
In the `frontend/` directory terminal, run:
```bash
npm run dev
```
Open your browser and navigate to the local URL (usually `http://localhost:5173`).

---

## 🔌 API Endpoint Documentation

All endpoints are prefix-mounted under `/api/v1/todos`.

| HTTP Method | Route Endpoint | Description | Request Body Format | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/todos` | Fetch all Todo tasks | *None* | `200 OK` |
| **POST** | `/api/v1/todos` | Create a new Todo | `{ "title": "String" }` | `201 Created` |
| **GET** | `/api/v1/todos/:id` | Fetch a single Todo by ID | *None* | `200 OK` |
| **PATCH** | `/api/v1/todos/:id` | Update completion or text | `{ "completed": Boolean, "title": "String" }` | `200 OK` |
| **DELETE** | `/api/v1/todos/:id` | Delete a Todo by ID | *None* | `200 OK` |

### JSON Schemas

#### Successful Todo Document
```json
{
  "_id": "649c11112222333344445555",
  "title": "Learn MERN Stack",
  "completed": false,
  "__v": 0
}
```

#### Error Response Format
All endpoint exceptions (e.g. 404 Not Found, 400 Bad Request) are returned in this standard format:
```json
{
  "msg": "Detailed description of what went wrong"
}
```

---

## 🛠️ Advanced Architectures Implemented

### 1. DRY Controller Async-Wrapper
Instead of writing redundant `try...catch` blocks inside every CRUD controller, the app uses an Express middleware helper:
```javascript
const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
```

### 2. Global Error Handling Middleware
Catches Mongoose schema validation constraints (like submitting an empty title or violating maximum length rules) and returns client-friendly errors automatically:
*   `ValidationError` → Returns status `400 Bad Request` with validation details.
*   `CastError` → Returns status `400 Bad Request` with query error details.
*   `CustomAPIError` → Returns status `404 Not Found` with specific message.

### 3. Multi-Stage Docker Build
The Dockerfile uses two stages to keep the final image lean:
- **Stage 1 (`base`)**: Uses a full Node image to install frontend dependencies and run `vite build`, producing the compiled `dist/` assets.
- **Stage 2 (`final`)**: Starts from a clean Node image, installs only backend production dependencies (`--omit=dev`), and copies the built frontend assets from Stage 1. The result is a single image with no frontend tooling, no devDependencies, and no source code — only what's needed to run.

### 4. Vite Development Proxy
All API fetch requests on the client are defined as relative paths `/api/v1/todos`. This is enabled via `vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```
This solves Cross-Origin Resource Sharing (CORS) errors automatically and ensures smooth environment setups.
