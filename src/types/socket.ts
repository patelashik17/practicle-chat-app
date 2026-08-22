import { JwtPayload } from "./auth";

export interface SocketUser extends JwtPayload {
  name: string;
}

export interface RoomEventPayload {
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

export interface ClientToServerEvents {
  "room:join": (payload: RoomEventPayload) => void;
  "room:leave": (payload: RoomEventPayload) => void;
}

export interface ServerToClientEvents {
  "room:user-joined": (payload: RoomUserJoinedPayload) => void;
  "room:user-left": (payload: RoomUserLeftPayload) => void;
  "socket:error": (payload: { message: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: SocketUser;
}
