process.env.NODE_ENV = "test";
process.env.PORT = "0";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://test:test@localhost:5432/test";
process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
process.env.JWT_EXPIRES_IN = "1h";

jest.mock("../src/lib/redis", () => ({
  redis: {
    on: jest.fn(),
    disconnect: jest.fn(),
  },
}));

jest.mock("../src/services/presence.service", () => ({
  addUserToRoom: jest.fn().mockResolvedValue(undefined),
  removeUserFromRoom: jest.fn().mockResolvedValue(undefined),
  removeUserFromAllRooms: jest.fn().mockResolvedValue([]),
  getRoomOnlineCount: jest.fn().mockResolvedValue(0),
  getRoomOnlineCounts: jest.fn().mockResolvedValue(new Map()),
  getRoomOnlineUserIds: jest.fn().mockResolvedValue([]),
  getUserRooms: jest.fn().mockResolvedValue([]),
}));

jest.mock("../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    roomMembership: {
      upsert: jest.fn(),
    },
    $disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));
