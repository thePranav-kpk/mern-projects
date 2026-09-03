import React, { useEffect, useRef, useState, type FormEvent } from "react";
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
type OnlineUsersType = { _id: string; name: string; email: string };

const ChatRoom = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const [activeRoom, setActiveRoom] = useState<string>("general");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [editingMessage, setEditingMessage] =
    useState<EditingMessageType | null>(null);
  const [typingUser, setTypingUser] = useState<string>("");
  const typingTimeoutRef = useRef<number | null>(null);
  const [showFullText, setShowFullText] = useState<boolean>(true);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsersType[]>([]);

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

  // Event listener on typing message
  useEffect(() => {
    socket?.on("typing", (data: { userName: string; isTyping: boolean }) => {
      if (data.isTyping) setTypingUser(data.userName);
      else setTypingUser("");
    });

    return () => {
      socket?.off("typing");
    };
  }, [socket]);

  useEffect(() => {
    if (!typingUser) return;

    const toggleInterval = setInterval(() => {
      setShowFullText((prev) => !prev);
    }, 1500);

    return () => {
      clearInterval(toggleInterval);
    };
  }, [typingUser]);

  // Event listener for online users
  useEffect(() => {
    socket?.on(
      "room_users",
      (data: { room: string; onlineUsers: OnlineUsersType[] }) => {
        if (data.room === activeRoom) setOnlineUsers(data.onlineUsers);
      },
    );

    return () => {
      socket?.off("room_users");
    };
  }, [socket, activeRoom]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
    setInputText(textValue);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (!textValue.trim()) {
      socket?.emit("user_typing", {
        _id: user?._id,
        room: activeRoom,
        isTyping: false,
      });
    } else {
      socket?.emit("user_typing", {
        _id: user?._id,
        room: activeRoom,
        isTyping: true,
      });
      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit("user_typing", {
          _id: user?._id,
          room: activeRoom,
          isTyping: false,
        });
      }, 4000);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">

        {/* Brand header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-base font-bold text-white tracking-tight">RealChat</span>
          </div>
        </div>

        {/* Rooms list */}
        <div className="flex-1 overflow-y-auto px-3 pt-4">
          <p className="px-2 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Rooms
          </p>
          <div className="space-y-0.5">
            {rooms.map((room) => {
              const isActive = activeRoom === room;
              return (
                <button
                  key={room}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span className={`text-base leading-none ${isActive ? "text-indigo-200" : "text-slate-600"}`}>#</span>
                  {room}
                </button>
              );
            })}
          </div>

          {/* Online Users */}
          <div className="mt-6 pt-4 border-t border-slate-800/60">
            <p className="px-2 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Online · {onlineUsers.length}
            </p>
            <ul className="space-y-1">
              {onlineUsers.map((onlineUser) => (
                <li
                  key={onlineUser._id}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <span className="relative flex-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 block"></span>
                    <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60"></span>
                  </span>
                  <span className="text-xs text-slate-300 font-medium truncate">
                    {onlineUser.name}
                  </span>
                  {onlineUser._id === user?._id && (
                    <span className="ml-auto text-[10px] text-slate-600 font-mono shrink-0">you</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* User footer */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold text-white shrink-0 uppercase">
            {user?.name?.charAt(0) ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main Chat Area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">

        {/* Chat header */}
        <header className="shrink-0 h-14 px-5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold text-lg leading-none">#</span>
            <h1 className="text-sm font-semibold text-white uppercase tracking-wider">{activeRoom}</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-rose-500"}`}></span>
            <span className={`font-medium ${isConnected ? "text-emerald-400" : "text-rose-400"}`}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </header>

        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xl">
                💬
              </div>
              <p className="text-slate-500 text-sm max-w-xs">
                No messages yet in <span className="text-slate-400 font-medium">#{activeRoom}</span>. Be the first to say something!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender?._id === user?._id;
              return (
                <div
                  key={message._id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"} group`}
                >
                  {/* Sender + timestamp row */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-semibold text-slate-400">
                      {isMine ? "You" : message.sender?.name || "Unknown"}
                    </span>
                    <span className="text-[10px] text-slate-600">
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
                      <span className="text-[10px] text-slate-600 italic">(edited)</span>
                    )}

                    {/* Edit / Delete triggers */}
                    {isMine && !message.isDeleted && (
                      <div className="flex items-center gap-2 text-[11px] ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMessage({
                              id: message._id,
                              content: message.content,
                            });
                            setInputText(message.content);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <span className="text-slate-700">·</span>
                        <button
                          type="button"
                          onClick={() => {
                            socket?.emit("delete_message", {
                              messageId: message._id,
                              room: activeRoom,
                            });
                          }}
                          className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-sm lg:max-w-lg px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      message.isDeleted
                        ? "bg-slate-900 text-slate-500 italic border border-slate-800 rounded-lg"
                        : isMine
                          ? "bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-500/10"
                          : "bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/40 shadow-sm"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {typingUser && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-indigo-400 italic">
              <span>{showFullText ? `${typingUser} is typing` : "Typing"}</span>
              <span className="inline-flex gap-0.5 font-bold not-italic">
                <span className="inline-block animate-bounce">.</span>
                <span className="inline-block animate-bounce [animation-delay:0.15s]">.</span>
                <span className="inline-block animate-bounce [animation-delay:0.3s]">.</span>
              </span>
            </div>
          )}
        </div>

        {/* Editing banner */}
        {editingMessage && (
          <div className="shrink-0 px-5 py-2.5 bg-indigo-950/70 border-t border-indigo-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-indigo-300">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Editing message</span>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-indigo-400 hover:text-white text-lg leading-none px-1 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Message input bar */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={
              editingMessage ? "Edit your message..." : `Message #${activeRoom}...`
            }
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700/60 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
          >
            {editingMessage ? "Save" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
