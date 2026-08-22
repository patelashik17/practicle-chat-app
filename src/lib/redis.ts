import Redis from "ioredis";
import { env } from "../config/env";

export const redis = new Redis(env.REDIS_URL);

redis.on("error", (error: Error) => {
  console.error("Redis connection error:", error.message);
});
