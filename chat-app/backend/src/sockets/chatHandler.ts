import { Server, Socket } from "socket.io";

// Attaches real-time event listeners
export const registerChatHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(
      `User connected via WebSocket: Session ID [${socket.id}], User ID [${socket.data.userId}]`,
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: Socket ID [${socket.id}]`);
    });
  });
};
