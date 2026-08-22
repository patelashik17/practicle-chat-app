import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().min(1, "Description is required").max(500),
});

export const roomIdParamSchema = z.object({
  id: z.string().uuid("Invalid room id"),
});

export const roomMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type RoomMessagesQuery = z.infer<typeof roomMessagesQuerySchema>;
