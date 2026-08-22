import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().min(1, "Description is required").max(500),
});

export const roomIdParamSchema = z.object({
  id: z.string().uuid("Invalid room id"),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
