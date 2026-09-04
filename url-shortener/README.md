# TrimURL: URL Shortener (Full-Stack TypeScript)

*   **Live Application**: [https://url-shortener-app-ud42.onrender.com](https://url-shortener-app-ud42.onrender.com)
*   **Live API Endpoint**: [https://url-shortener-app-ud42.onrender.com/api/v1/urls/shorten](https://url-shortener-app-ud42.onrender.com/api/v1/urls/shorten)

A full-stack TypeScript URL shortener and click analytics web application built using Node.js, Express 5, React 19, TypeScript, and MongoDB. This project generates unique 6-character collision-resistant short codes (`nanoid`), forwards browsers using HTTP `302 Found` redirection headers, atomically increments click analytics via MongoDB `$inc`, and renders dynamic vector QR codes for instant mobile sharing.

---

## 🚀 Tech Stack

*   **Frontend**: React 19, TypeScript (`.tsx`), JavaScript, Vanilla CSS (Variables, Glassmorphism, Responsive Layouts), `qrcode.react`, `lucide-react`
*   **Backend**: Node.js, Express 5, TypeScript (`.ts`), `ts-node-dev`, `nanoid@3`, `http-status-codes`, `dotenv`, `cors`
*   **Database**: MongoDB Atlas, Mongoose ODM with TypeScript Interface definitions (`IUrl`)
*   **Containerization**: Docker (3-stage build — Vite build → TypeScript compile → Node.js serve)

---

## 📁 Folder Structure

```text
url-shortener/
├── backend/
│   ├── src/
│   │   ├── config/          # db.ts (TypeScript Mongoose connection helper)
│   │   ├── controllers/     # urlController.ts (shortenUrl, redirectUrl, getUrlStats)
│   │   ├── models/          # Url.ts (IUrl TypeScript Interface + Mongoose B-Tree Schema)
│   │   ├── routes/          # urlRoutes.ts (API route handlers)
│   │   └── server.ts        # Express TypeScript entry point (serves compiled static frontend)
│   ├── dist/                # Compiled JavaScript production build output (ignored by Git)
│   ├── tsconfig.json        # TypeScript compiler configuration
│   └── package.json         # Node scripts & TS dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # UrlForm.tsx, UrlCard.tsx (Props Interfaces, Lucide icons, QR Code SVG)
│   │   ├── types/           # api.types.ts (URLData Interface definition)
│   │   ├── App.tsx          # Main layout container & URL state coordinator
│   │   ├── index.css        # Glassmorphism dark-theme variables & typography
│   │   └── main.tsx
│   ├── tsconfig.json        # Frontend TypeScript compiler configuration
│   ├── package.json         # Vite React TS scripts & dependencies
│   └── vite.config.ts       # Vite build tool config with dev server proxies
├── Dockerfile               # 3-stage Docker build
├── .dockerignore            # Excludes node_modules, dist, .env from build context
└── README.md                # Project documentation
```

---

## 🐳 Running with Docker (Recommended)

This is the recommended way to run the application locally. Docker compiles the TypeScript backend, builds the React frontend, and runs everything as a single container.

### Prerequisites
Make sure you have [Docker](https://docs.docker.com/get-docker/) installed and a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string ready.

### 1. Build the Docker Image
From the `url-shortener/` directory:
```bash
docker build -t url-shortener .
```
Docker will:
- **Stage 1**: Install frontend dependencies and run `vite build`
- **Stage 2**: Install all backend dependencies (including TypeScript) and run `tsc` to compile `src/` → `dist/`
- **Stage 3**: Fresh install of production-only dependencies, copy compiled `dist/` and React assets — no TypeScript compiler, no source files, no devDependencies in the final image

### 2. Run the Container
```bash
docker run -p 5000:5000 \
  -e MONGO_URI="mongodb+srv://<username>:<password>@<cluster-url>/url_shortener_db?retryWrites=true&w=majority" \
  url-shortener
```
Open your browser and navigate to `http://localhost:5000`.

> **Note**: The `-e` flag injects environment variables at runtime. Never bake secrets into the image itself.

---

## 🛠️ Installation & Local Setup (Without Docker)

Follow these steps if you prefer running the frontend and backend TypeScript servers separately in development mode.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed and a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database set up.

### 1. Configure the Backend
1. Navigate to the `backend` directory:
   ```bash
   cd url-shortener/backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your configurations:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/url_shortener_db?retryWrites=true&w=majority
   ```

### 2. Configure the Frontend
1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd url-shortener/frontend
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
`ts-node-dev` will start on port `5000` with hot-reloading:
```text
Connected to MongoDB successfully...
Server is listening on port 5000...
```

### Start the Frontend
In the `frontend/` directory terminal, run:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`. The Vite proxy will route `/api` and `/r` calls automatically to port 5000.

---

## 🔌 API Endpoint Documentation

### Shortener & Analytics Routes

| HTTP Method | Route Endpoint | Description | Payload / Request Format | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/urls/shorten` | Generate a 6-character short link | `{ "originalUrl": "https://example.com/very-long-link" }` | `201 Created` / `200 OK` |
| **GET** | `/r/:shortCode` | HTTP 302 Redirect to destination URL + Atomic `$inc` | *Redirection request* | `302 Found` |
| **GET** | `/api/v1/urls/stats/:shortCode` | Fetch click analytics for short link | *None* | `200 OK` |

---

## 🛠️ Advanced Architectures Implemented

### 1. 3-Stage Docker Build (TypeScript)
TypeScript introduces a compile step that plain JavaScript apps don't need. The Dockerfile uses 3 stages to keep the final image lean and secure:
- **Stage 1 (`base`)**: Builds the React frontend with Vite — produces `frontend/dist/`
- **Stage 2 (`final`)**: Installs **all** backend dependencies (including `tsc` from devDependencies) and compiles TypeScript `src/` → `dist/`
- **Stage 3 (`run`)**: Starts clean — copies only the compiled `dist/` from Stage 2 and the frontend assets from Stage 1, then does a fresh `npm install --omit=dev`. The final image contains no TypeScript source, no compiler, and no devDependencies.

### 2. Full-Stack TypeScript Interface Typing (`IUrl` & `URLData`)
Every database model, API payload, and React component prop is typed at compile-time:
```typescript
export interface IUrl extends Document {
  originalUrl: string;
  shortCode: string;
  clicks: number;
  lastClickedAt?: Date | null;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Atomic MongoDB Counter Increment (`$inc` & `$set`)
To eliminate race condition bugs when multiple users click a short link simultaneously, click counts and timestamps are updated atomically in the database engine:
```typescript
const url = await Url.findOneAndUpdate(
  { shortCode },
  { $inc: { clicks: 1 }, $set: { lastClickedAt: new Date() } },
  { new: true }
);
```

### 4. HTTP 302 Redirection Engine (`res.redirect`)
The server returns a standard HTTP 302 Found response, instructing browsers to forward immediately to the destination site:
```typescript
res.redirect(url.originalUrl);
```

### 5. Dynamic Vector QR Code Generation (`qrcode.react`)
Short links automatically generate scalable SVG QR codes in real-time, allowing users to scan links directly from desktop to mobile devices.
