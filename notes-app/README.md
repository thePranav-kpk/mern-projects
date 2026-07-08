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
│   ├── package.json          # Node scripts & dependencies
│   └── server.js             # Express application entry point (serves compiled static frontend)
├── frontend/
│   ├── dist/                 # Compiled production assets (ignored by Git)
│   ├── src/
│   │   ├── components/       # ProtectedRoute, Navbar, NoteCard, AddEditNoteModal
│   │   ├── context/          # AuthContext (global state, auto-login, logout)
│   │   ├── pages/            # Login, Register, Dashboard
│   │   ├── App.css           # Global layout adjustments
│   │   ├── App.jsx           # Main routing tree
│   │   ├── index.css         # Custom dark glassmorphic variables and layouts
│   │   └── main.jsx
│   ├── package.json          # Vite React scripts & configurations
│   └── vite.config.js        # Vite build tool config with dev server proxy
└── README.md                 # Project documentation
```

---

## 🛠️ Installation & Local Setup

Follow these steps to run both the frontend and backend servers simultaneously on your machine.

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

---

## ⚡ Running the Application Locally (Development)

To run the application locally in development mode:

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

### 1. Multi-Tenant Database Isolation
To ensure strict separation of user data, every note includes a reference to its owner:
```javascript
userId: {
  type: mongoose.Types.ObjectId,
  ref: "User",
  required: true
}
```
All CRUD database actions filter by **both** the note `_id` and the verified JWT user ID (`req.user.userId`), preventing users from accessing or editing other users' notes.

### 2. React 19 Key-Based Component Resetting
Rather than utilizing side effects (`useEffect`) inside the `AddEditNoteModal` to reset inputs (which triggers cascading renders), the component is mounted inside the Dashboard using a unique **`key` prop**:
```jsx
<AddEditNoteModal
  key={noteToEdit ? noteToEdit._id : isModalOpen ? "open" : "closed"}
/>
```
This forces React to cleanly unmount the old modal and construct a new one, resetting states instantly with no rendering overhead.
