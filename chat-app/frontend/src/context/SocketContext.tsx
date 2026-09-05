/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined,
);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const socketInstance: Socket = io(`${baseUrl}/`, {
      withCredentials: true,
    });

    // Event listeners
    socketInstance.on("connect", () => {
      setSocket(socketInstance);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setSocket(null);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Cleanup on unmount or user logout
    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [baseUrl, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
