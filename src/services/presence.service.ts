import { redis } from "../lib/redis";

const ROOM_KEY_PREFIX = "presence:room:";
const USER_KEY_PREFIX = "presence:user:";

function roomKey(roomId: string): string {
  return `${ROOM_KEY_PREFIX}${roomId}`;
}

function userKey(userId: string): string {
  return `${USER_KEY_PREFIX}${userId}`;
}

export async function getRoomOnlineCount(roomId: string): Promise<number> {
  return redis.scard(roomKey(roomId));
}

export async function getRoomOnlineCounts(
  roomIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (roomIds.length === 0) {
    return counts;
  }

  const pipeline = redis.pipeline();
  for (const roomId of roomIds) {
    pipeline.scard(roomKey(roomId));
  }

  const results = await pipeline.exec();

  roomIds.forEach((roomId, index) => {
    const result = results?.[index]?.[1];
    counts.set(roomId, typeof result === "number" ? result : 0);
  });

  return counts;
}

export async function getRoomOnlineUserIds(roomId: string): Promise<string[]> {
  return redis.smembers(roomKey(roomId));
}

export async function addUserToRoom(
  userId: string,
  roomId: string
): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.sadd(roomKey(roomId), userId);
  pipeline.sadd(userKey(userId), roomId);
  await pipeline.exec();
}

export async function removeUserFromRoom(
  userId: string,
  roomId: string
): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.srem(roomKey(roomId), userId);
  pipeline.srem(userKey(userId), roomId);
  await pipeline.exec();
}

export async function removeUserFromAllRooms(userId: string): Promise<string[]> {
  const roomIds = await redis.smembers(userKey(userId));

  if (roomIds.length === 0) {
    return [];
  }

  const pipeline = redis.pipeline();
  for (const roomId of roomIds) {
    pipeline.srem(roomKey(roomId), userId);
  }
  pipeline.del(userKey(userId));
  await pipeline.exec();

  return roomIds;
}

export async function getUserRooms(userId: string): Promise<string[]> {
  return redis.smembers(userKey(userId));
}
