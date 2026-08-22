import { Socket } from "socket.io";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket";

type AuthSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export async function socketAuthMiddleware(
  socket: AuthSocket,
  next: (err?: Error) => void
): Promise<void> {
  const token = socket.handshake.auth.token;

  if (typeof token !== "string" || token.length === 0) {
    next(new Error("Authentication required"));
    return;
  }

  try {
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      next(new Error("Authentication failed"));
      return;
    }

    socket.data.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch {
    next(new Error("Authentication failed"));
  }
}
