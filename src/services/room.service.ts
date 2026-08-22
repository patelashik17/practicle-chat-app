import { prisma } from "../lib/prisma";
import {
  getRoomOnlineCount,
  getRoomOnlineCounts,
  getRoomOnlineUserIds,
} from "./presence.service";
import {
  ArchivedRoom,
  RoomDetail,
  RoomListItem,
} from "../types/room";
import { CreateRoomInput } from "../schemas/room.schema";

export class RoomError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "RoomError";
  }
}

export async function createRoom(
  ownerId: string,
  input: CreateRoomInput
): Promise<RoomListItem> {
  const room = await prisma.room.create({
    data: {
      name: input.name,
      description: input.description,
      ownerId,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  return {
    id: room.id,
    name: room.name,
    description: room.description,
    status: room.status,
    createdAt: room.createdAt,
    lastActivityAt: room.lastActivityAt,
    owner: room.owner,
    messageCount: room._count.messages,
    onlineUserCount: 0,
  };
}

export async function listActiveRooms(): Promise<RoomListItem[]> {
  const rooms = await prisma.room.findMany({
    where: { status: "active" },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { lastActivityAt: "desc" },
  });

  const roomIds = rooms.map((room) => room.id);
  const onlineCounts = await getRoomOnlineCounts(roomIds);

  return rooms.map((room) => ({
    id: room.id,
    name: room.name,
    description: room.description,
    status: room.status,
    createdAt: room.createdAt,
    lastActivityAt: room.lastActivityAt,
    owner: room.owner,
    messageCount: room._count.messages,
    onlineUserCount: onlineCounts.get(room.id) ?? 0,
  }));
}

export async function getRoomById(roomId: string): Promise<RoomDetail> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  if (!room) {
    throw new RoomError("Room not found", 404);
  }

  const recentMessages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  const onlineUserIds = await getRoomOnlineUserIds(roomId);

  const onlineUsers =
    onlineUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: onlineUserIds } },
          select: { id: true, name: true },
        })
      : [];

  return {
    id: room.id,
    name: room.name,
    description: room.description,
    status: room.status,
    createdAt: room.createdAt,
    lastActivityAt: room.lastActivityAt,
    owner: room.owner,
    messageCount: room._count.messages,
    messages: recentMessages.reverse().map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      user: message.user,
    })),
    onlineUsers,
  };
}

export async function archiveRoom(
  roomId: string,
  userId: string
): Promise<ArchivedRoom> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new RoomError("Room not found", 404);
  }

  if (room.ownerId !== userId) {
    throw new RoomError("Only the room owner can archive this room", 403);
  }

  if (room.status === "archived") {
    throw new RoomError("Room is already archived", 409);
  }

  const archived = await prisma.room.update({
    where: { id: roomId },
    data: { status: "archived" },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  return {
    id: archived.id,
    name: archived.name,
    status: "archived" as const,
    archivedAt: new Date(),
  };
}

export async function assertActiveRoom(roomId: string): Promise<void> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { status: true },
  });

  if (!room) {
    throw new RoomError("Room not found", 404);
  }

  if (room.status === "archived") {
    throw new RoomError("Room is archived", 403);
  }
}

export { getRoomOnlineCount };
