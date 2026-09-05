# MERN Expense Tracker & Financial Analytics

*   **Live Application**: [https://expense-tracker-ogmi.onrender.com](https://expense-tracker-ogmi.onrender.com)
*   **Live API Endpoint**: [https://expense-tracker-ogmi.onrender.com/api/v1/transactions](https://expense-tracker-ogmi.onrender.com/api/v1/transactions) (Requires Authentication)

A multi-user financial tracking and analytics application built using the MERN stack (MongoDB, Express 5, React 19, Node.js). This project implements server-side MongoDB Aggregation Pipelines to compute financial summary metrics (Total Income, Total Expense, Net Balance) and category-wise expenditure breakdowns, paired with a React `useReducer` state management architecture.

---

## 🚀 Tech Stack

*   **Frontend**: React 19, React Router Dom, JavaScript, Vanilla CSS (Variables, Glassmorphism, Responsive Grid)
*   **Backend**: Node.js, Express 5 (MongoDB Aggregation Pipelines, RegExp routing, middleware architecture)
*   **Database**: MongoDB Atlas, Mongoose ODM
*   **Authentication**: JSON Web Tokens (JWT), `bcryptjs` password hashing
*   **Containerization**: Docker Compose (separate backend + Nginx frontend containers)

---

## 📁 Folder Structure

```text
expense-tracker/
├── backend/
│   ├── controllers/          # auth.js & transactions.js (CRUD + $match/$group aggregations)
│   ├── db/                   # Database connect.js file
│   ├── errors/               # CustomAPIError class
│   ├── middleware/           # async.js, error-handler.js, not-found.js, auth.js (JWT guard)
│   ├── models/               # User.js & Transaction.js (Enums, Min validators)
│   ├── routes/               # Express auth & transactions route mappings
│   ├── .env                  # Environment configurations (local only)
│   ├── Dockerfile            # Backend-only Node.js container
│   ├── package.json          # Node scripts & dependencies
│   └── server.js             # Express entry point (serves compiled static frontend)
├── frontend/
│   ├── src/
│   │   ├── components/       # SummaryCards, CategoryBreakdown, TransactionForm, TransactionList, Navbar, ProtectedRoute
│   │   ├── context/          # ExpenseContext (useReducer, Promise.all) & AuthContext
│   │   ├── pages/            # Login, Register, Dashboard
│   │   ├── App.jsx           # Main router tree & Context providers
│   │   ├── index.css         # Dark glassmorphism layout & theme variables
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
Create a `.env` file in the `expense-tracker/` directory (same level as `docker-compose.yml`):
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/expense_db?retryWrites=true&w=majority
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
docker pull pranav1306/mern-projects:expense-tracker-backend
docker pull pranav1306/mern-projects:expense-tracker-frontend
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
   cd expense-tracker/backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your configurations:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/expense_db?retryWrites=true&w=majority
   JWT_SECRET=yoursupersecurejwtsecretkey
   ```

### 2. Configure the Frontend
1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd expense-tracker/frontend
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
Server is listening on port 5000...
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

### Transactions & Analytics Routes (Requires Header: `Authorization: Bearer <TOKEN>`)

| HTTP Method | Route Endpoint | Description | Request Query / Body Format | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/transactions` | Fetch all user transactions (supports query filters) | `?type=expense&category=Food` | `200 OK` |
| **GET** | `/api/v1/transactions/summary` | Fetch computed Income, Expense & Net Balance totals via MongoDB Aggregation | *None* | `200 OK` |
| **GET** | `/api/v1/transactions/category-breakdown` | Fetch category totals via `$match`, `$group`, `$sort`, `$project` aggregation pipeline | `?type=expense` | `200 OK` |
| **POST** | `/api/v1/transactions` | Add a new transaction | `{ "title": "...", "amount": 100, "type": "expense", "category": "Food" }` | `201 Created` |
| **PATCH** | `/api/v1/transactions/:id` | Update transaction details | `{ "amount": 150 }` | `200 OK` |
| **DELETE** | `/api/v1/transactions/:id` | Delete a transaction by ID | *None* | `200 OK` |

---

## 🛠️ Advanced Architectures Implemented

### 1. Multi-Container Docker Compose Architecture
Instead of bundling the frontend into the backend image, this app uses Docker Compose to run two isolated containers:
- **Backend container**: Pure Express API — no static file serving, no frontend tooling
- **Frontend container**: Nginx serves the compiled React SPA and acts as a **reverse proxy**, forwarding all `/api/*` requests to the backend container over Docker's internal network. The browser only ever talks to port 80 — it never directly hits port 5000.

### 2. Nginx as Reverse Proxy (no CORS needed)
Since Nginx forwards `/api/` requests to the backend on the same Docker network, **both frontend and backend appear to be on the same origin** from the browser's perspective. This eliminates CORS entirely for the containerized deployment.

### 3. MongoDB Aggregation Pipelines (`$match`, `$group`, `$sort`, `$project`)
Rather than computing financial totals using JavaScript loops in Node, the application offloads heavy financial math directly to MongoDB's native C++ aggregation engine.
```javascript
const stats = await Transaction.aggregate([
  {
    $match: {
      userId: new mongoose.Types.ObjectId(req.user.userId),
      type: type || "expense",
    },
  },
  {
    $group: {
      _id: "$category",
      total: { $sum: "$amount" },
      count: { $sum: 1 },
    },
  },
  { $sort: { total: -1 } },
  {
    $project: {
      _id: 0,
      category: "$_id",
      total: 1,
      count: 1,
    },
  },
]);
```

### 4. React `useReducer` + `Promise.all` State Synchronization
All financial states (`transactions`, `summary`, `breakdown`) are managed atomically via a central `expenseReducer`. Data loading occurs concurrently using `Promise.all`:
```javascript
const [txRes, sumRes, catRes] = await Promise.all([
  fetch("/api/v1/transactions", { headers: { Authorization: `Bearer ${token}` } }),
  fetch("/api/v1/transactions/summary", { headers: { Authorization: `Bearer ${token}` } }),
  fetch("/api/v1/transactions/category-breakdown?type=expense", { headers: { Authorization: `Bearer ${token}` } }),
]);
```

### 5. Strict Schema Validation (`enum` & `min`)
Mongoose enforces strict type rules and value boundaries before saving entries to the database:
```javascript
type: {
  type: String,
  required: [true, "Please specify transaction type"],
  enum: {
    values: ["income", "expense"],
    message: "{VALUE} is not a valid transaction type",
  },
},
amount: {
  type: Number,
  required: [true, "Please provide transaction amount"],
  min: [0.01, "Amount must be greater than 0"],
}
```
