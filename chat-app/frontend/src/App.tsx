import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { SocketProvider, useSocket } from "./context/SocketContext";

const ChatHome: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}! 👋</h1>
        <p className="text-slate-400 text-sm mb-6">
          Active Session: {user?.email}
        </p>

        <div className="text-xs font-mono mb-4 px-3 py-1 bg-slate-800 rounded-full inline-block">
          Status:{" "}
          {isConnected ? (
            <span className="text-emerald-400">Connected 🟢</span>
          ) : (
            <span className="text-rose-400">Disconnected 🔴</span>
          )}
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 font-medium rounded-lg text-sm transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ChatHome></ChatHome>
                </ProtectedRoute>
              }
            ></Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
