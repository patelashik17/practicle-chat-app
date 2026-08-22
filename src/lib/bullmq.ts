import Redis from "ioredis";
import { env } from "../config/env";

export function createBullMqConnection(): Redis {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
}
