import { prisma } from "../lib/prisma";

export interface CreatedMessage {
  id: string;
  roomId: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
}

export async function createRoomMessage(
  roomId: string,
  userId: string,
  content: string
): Promise<CreatedMessage> {
  const now = new Date();

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        roomId,
        userId,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    await tx.room.update({
      where: { id: roomId },
      data: { lastActivityAt: now },
    });

    return created;
  });

  return {
    id: message.id,
    roomId: message.roomId,
    content: message.content,
    createdAt: message.createdAt,
    user: message.user,
  };
}
