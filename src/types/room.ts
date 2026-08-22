export interface RoomOwnerSummary {
  id: string;
  name: string;
  email: string;
}

export interface RoomListItem {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived";
  createdAt: Date;
  lastActivityAt: Date;
  owner: RoomOwnerSummary;
  messageCount: number;
  onlineUserCount: number;
}

export interface RoomMessageItem {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
}

export interface RoomOnlineUser {
  id: string;
  name: string;
}

export interface MessagePagination {
  page: number;
  pageSize: number;
  totalMessages: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RoomDetail {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived";
  createdAt: Date;
  lastActivityAt: Date;
  owner: RoomOwnerSummary;
  messageCount: number;
  messages: RoomMessageItem[];
  onlineUsers: RoomOnlineUser[];
  pagination: MessagePagination;
}

export interface ArchivedRoom {
  id: string;
  name: string;
  status: "archived";
  archivedAt: Date;
}
