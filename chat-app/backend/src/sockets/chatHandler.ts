import { Server, Socket } from "socket.io";
import Message from "../models/Message";
import User from "../models/User";

// Helper function to calculate online users
const broadcastRoomUsers = async (io: Server, room: string) => {
  const roomSockets = await io.in(room).fetchSockets();
  const uniqueUsers = Array.from(
    new Set(roomSockets.map((socket) => socket.data.userId)),
  );

  const onlineUsers = await User.find({ _id: { $in: uniqueUsers } }).select(
    "name email",
  );

  io.to(room).emit("room_users", { room, onlineUsers });
};

// Attaches real-time event listeners
export const registerChatHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(
      `User connected via WebSocket: Session ID [${socket.id}], User ID [${socket.data.userId}]`,
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: Socket ID [${socket.id}]`);
    });

    socket.on("disconnecting", () => {
      const roomsToUpdate = Array.from(socket.rooms);

      // Current online users after disconnected
      setTimeout(async () => {
        for (const room of roomsToUpdate) {
          if (room !== socket.id) {
            await broadcastRoomUsers(io, room);
          }
        }
      }, 50);
    });

    socket.on("join_room", async (room: string) => {
      socket.join(room);

      // Current online users after joining room
      await broadcastRoomUsers(io, room);
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

    socket.on(
      "edit_message",
      async (data: { messageId: string; room: string; newContent: string }) => {
        try {
          const { messageId, room, newContent } = data;
          const userId = socket.data.userId;

          // Verify userId and content
          if (!userId || !newContent.trim()) return;

          const message = await Message.findById(messageId);

          // Verify the existence of message
          if (!message || message.sender.toString() !== userId) {
            return socket.emit("error", "Unauthorized access");
          }

          // Update the message content
          message.content = newContent.trim();
          message.isEdited = true;

          // Save to DB
          await message.save();

          // Populate the message to fetch name & email and pass to sender instead of userId
          const populatedMessage = await message.populate(
            "sender",
            "name email",
          );

          io.to(room).emit("message_edited", populatedMessage);
        } catch (err) {
          console.log("Error in editing message: ", err);
        }
      },
    );

    socket.on(
      "delete_message",
      async (data: { messageId: string; room: string }) => {
        try {
          const { messageId, room } = data;
          const userId = socket.data.userId;

          if (!userId) return;

          const message = await Message.findById(messageId);
          if (!message || message.sender.toString() !== userId) {
            return socket.emit("error", "Unauthorized access");
          }

          message.isDeleted = true;
          message.content = "This message is deleted";

          await message.save();

          const populatedMessage = await message.populate(
            "sender",
            "name email",
          );

          io.to(room).emit("message_deleted", populatedMessage);
        } catch (err) {
          console.log("Error in deleting message: ", err);
        }
      },
    );

    socket.on(
      "user_typing",
      async (data: { _id: string; room: string; isTyping: boolean }) => {
        const { _id, room, isTyping } = data;
        const user = await User.findById(_id);
        const userName = user?.name || "Someone";

        // Use socket which broadcasts to everyone except the sender
        socket.to(room).emit("typing", { userName, isTyping });
      },
    );
  });
};
