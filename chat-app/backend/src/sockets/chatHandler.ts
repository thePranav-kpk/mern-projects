import { Server, Socket } from "socket.io";
import Message from "../models/Message";
import User from "../models/User";

// Attaches real-time event listeners
export const registerChatHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(
      `User connected via WebSocket: Session ID [${socket.id}], User ID [${socket.data.userId}]`,
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: Socket ID [${socket.id}]`);
    });

    socket.on("join_room", (room: string) => {
      socket.join(room);
      console.log(`User [${socket.data.userId}] joined room [${room}]`);
    });

    socket.on(
      "send_message",
      async (data: { room: string; content: string }) => {
        try {
          const { room, content } = data;
          const userId = socket.data.userId;

          if (!content || !content.trim()) return;

          // Save message to MongoDB
          const newMessage = await Message.create({
            sender: userId, // userId is string
            room,
            content: content.trim(),
          });

          // Populate sender details
          // Fetches name & email from User collection as sender references User and then replaces userId string with name & email
          const populatedMessage = await newMessage.populate(
            "sender",
            "name email",
          );

          // Broadcast to all users in the room including sender
          io.to(room).emit("receive_message", populatedMessage);
        } catch (err) {
          console.log("Error saving/sending messages: ", err);
        }
      },
    );
  });
};
