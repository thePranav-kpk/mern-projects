import { Socket } from "socket.io";
import { ExtendedError } from "socket.io";
import { RequestHandler } from "express";

// Converts Express middleware (3 args) into Socket.io middleware (2 args)
export const wrapSession =
  (expressMiddleware: RequestHandler) =>
  (socket: Socket, next: (err?: ExtendedError) => void) => {
    // 1. Socket.io stores the initial HTTP handshake request in socket.request i.e.,
    // socket.request=HTTP req
    // 2. We pass socket.request and an empty response object {} into expressMiddleware

    // We are passing these args to the function which is returned by session function
    expressMiddleware(
      socket.request as any, // socket.request is passed as req arg in Express Middleware
      {} as any, // Empty object passed as res arg
      next as any, // Socket.io's next is passed as next arg
    );
  };

// Now socketAuth can verify sessionId as socket.request stores HTTP request, which stores sessionId
export const socketAuth = (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  const session = (socket.request as any).session;

  if (!session || !session.userId) {
    return next(new Error("Unauthorized: Invalid session"));
  }

  // Attach authenticated userId to socket
  socket.data.userId = session.userId;
  next();
};
