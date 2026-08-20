import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

interface Message {
  _id: string;
  sender: { _id: string; name: string; email: string };
  room: string;
  content: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

type EditingMessageType = { id: string; content: string };

const ChatRoom = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const [activeRoom, setActiveRoom] = useState<string>("general");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [editingMessage, setEditingMessage] =
    useState<EditingMessageType | null>(null);

  const rooms = ["general", "tech", "other"];

  // Fetch all messages belonging to activeRoom
  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${activeRoom}`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.log("Fetch messages error: ", err);
      }
    };

    getMessages();
    socket?.emit("join_room", activeRoom);
  }, [activeRoom, socket]);

  // Event listener on receiving message
  useEffect(() => {
    socket?.on("receive_message", (newMessage: Message) => {
      if (newMessage.room === activeRoom) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket?.off("receive_message");
    };
  }, [activeRoom, socket]);

  // Event listener on editing message
  useEffect(() => {
    socket?.on("message_edited", (editedMessage) => {
      setMessages((prevMessages) => {
        return prevMessages.map((message) => {
          if (message._id === editedMessage._id) return editedMessage;
          return message;
        });
      });
    });

    return () => {
      socket?.off("message_edited");
    };
  }, [socket]);

  // Event listener on deleting message
  useEffect(() => {
    socket?.on("message_deleted", (deletedMessage) => {
      setMessages((prevMessages) => {
        return prevMessages.map((message) => {
          if (message._id === deletedMessage._id) return deletedMessage;
          return message;
        });
      });
    });

    return () => {
      socket?.off("message_deleted");
    };
  }, [socket]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (editingMessage) {
      socket?.emit("edit_message", {
        messageId: editingMessage.id,
        room: activeRoom,
        newContent: inputText.trim(),
      });
      setEditingMessage(null);
    } else {
      socket?.emit("send_message", {
        room: activeRoom,
        content: inputText.trim(),
      });
    }
    setInputText("");
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInputText("");
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Sidebar (Left Column) */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-6 px-2">
            RealChat Rooms
          </h2>
          <div className="space-y-1">
            {rooms.map((room) => {
              const isActive = activeRoom === room;
              return (
                <button
                  key={room}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  # {room}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Footer & Logout */}
        <div className="border-t border-slate-800 pt-4 px-2 flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area (Right Column) */}
      <div className="flex-1 flex flex-col h-full bg-slate-950">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-md font-bold text-white uppercase tracking-wider">
            # {activeRoom}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Status:</span>
            <span>{isConnected ? "Connected 🟢" : "Disconnected 🔴"}</span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 text-sm mt-8">
              No messages yet in #{activeRoom}. Be the first to start the
              conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender?._id === user?._id;
              return (
                <div
                  key={message._id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"} group`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-slate-400">
                      {isMine ? "You" : message.sender?.name || "Unknown"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(
                        message.isEdited && message.updatedAt
                          ? message.updatedAt
                          : message.createdAt,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.isEdited && !message.isDeleted && (
                      <span className="text-[10px] text-slate-500 italic">
                        (edited)
                      </span>
                    )}

                    {/* Edit / Delete triggers for own messages */}
                    {isMine && !message.isDeleted && (
                      <div className="flex items-center gap-2 text-[11px] ml-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMessage({
                              id: message._id,
                              content: message.content,
                            });
                            setInputText(message.content);
                          }}
                          className="text-indigo-400 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            socket?.emit("delete_message", {
                              messageId: message._id,
                              room: activeRoom,
                            });
                          }}
                          className="text-rose-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className={`max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      message.isDeleted
                        ? "bg-slate-900/60 text-slate-500 italic border border-slate-800 rounded-lg"
                        : isMine
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Editing Banner Indicator */}
        {editingMessage && (
          <div className="px-4 py-2 bg-indigo-950/60 border-t border-indigo-800/40 text-xs text-indigo-300 flex justify-between items-center">
            <span>Editing message...</span>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-indigo-400 hover:text-white font-bold text-sm px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Message Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              editingMessage ? "Edit message..." : `Message #${activeRoom}...`
            }
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition"
          >
            {editingMessage ? "Save" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
