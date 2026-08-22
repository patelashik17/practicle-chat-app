import { Server, Socket } from "socket.io";
import {
  roomMessageSchema,
  roomTypingSchema,
} from "../schemas/socket.schema";
import { createRoomMessage } from "../services/message.service";
import { assertActiveRoom, RoomError } from "../services/room.service";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket";

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

function emitSocketError(socket: AppSocket, message: string): void {
  socket.emit("socket:error", { message });
}

function isSocketInRoom(socket: AppSocket, roomId: string): boolean {
  return socket.rooms.has(roomId);
}

export function registerMessageHandlers(io: AppServer, socket: AppSocket): void {
  socket.on("room:message", async (payload) => {
    const parsed = roomMessageSchema.safeParse(payload);

    if (!parsed.success) {
      emitSocketError(socket, "Invalid message payload");
      return;
    }

    const { roomId, content } = parsed.data;
    const { userId } = socket.data.user;

    if (!isSocketInRoom(socket, roomId)) {
      emitSocketError(socket, "You must join the room before sending messages");
      return;
    }

    try {
      await assertActiveRoom(roomId);

      const message = await createRoomMessage(roomId, userId, content);

      io.to(roomId).emit("room:new-message", message);
    } catch (error) {
      if (error instanceof RoomError) {
        emitSocketError(socket, error.message);
        return;
      }
      emitSocketError(socket, "Failed to send message");
    }
  });

  socket.on("room:typing", (payload) => {
    const parsed = roomTypingSchema.safeParse(payload);

    if (!parsed.success) {
      emitSocketError(socket, "Invalid typing payload");
      return;
    }

    const { roomId } = parsed.data;
    const { userId, name } = socket.data.user;

    if (!isSocketInRoom(socket, roomId)) {
      emitSocketError(socket, "You must join the room before typing");
      return;
    }

    socket.to(roomId).emit("room:typing-indicator", {
      roomId,
      user: { id: userId, name },
    });
  });
}
