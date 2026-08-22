import { JwtPayload } from "./auth";

export interface SocketUser extends JwtPayload {
  name: string;
}

export interface RoomEventPayload {
  roomId: string;
}

export interface RoomMessagePayload {
  roomId: string;
  content: string;
}

export interface RoomTypingPayload {
  roomId: string;
}

export interface RoomUserJoinedPayload {
  roomId: string;
  user: {
    id: string;
    name: string;
  };
}

export interface RoomUserLeftPayload {
  roomId: string;
  userId: string;
}

export interface RoomNewMessagePayload {
  id: string;
  roomId: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
}

export interface RoomTypingIndicatorPayload {
  roomId: string;
  user: {
    id: string;
    name: string;
  };
}

export interface ClientToServerEvents {
  "room:join": (payload: RoomEventPayload) => void;
  "room:leave": (payload: RoomEventPayload) => void;
  "room:message": (payload: RoomMessagePayload) => void;
  "room:typing": (payload: RoomTypingPayload) => void;
}

export interface ServerToClientEvents {
  "room:user-joined": (payload: RoomUserJoinedPayload) => void;
  "room:user-left": (payload: RoomUserLeftPayload) => void;
  "room:new-message": (payload: RoomNewMessagePayload) => void;
  "room:typing-indicator": (payload: RoomTypingIndicatorPayload) => void;
  "socket:error": (payload: { message: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: SocketUser;
}
