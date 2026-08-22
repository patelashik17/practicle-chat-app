import { z } from "zod";

export const roomEventSchema = z.object({
  roomId: z.string().uuid("Invalid room id"),
});

export type RoomEventPayload = z.infer<typeof roomEventSchema>;
