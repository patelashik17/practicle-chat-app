import { z } from "zod";

export const roomEventSchema = z.object({
  roomId: z.string().uuid("Invalid room id"),
});

export const roomMessageSchema = z.object({
  roomId: z.string().uuid("Invalid room id"),
  content: z
    .string()
    .trim()
    .min(1, "Message content is required")
    .max(2000, "Message must be at most 2000 characters"),
});

export const roomTypingSchema = z.object({
  roomId: z.string().uuid("Invalid room id"),
});

export type RoomEventPayload = z.infer<typeof roomEventSchema>;
export type RoomMessagePayload = z.infer<typeof roomMessageSchema>;
export type RoomTypingPayload = z.infer<typeof roomTypingSchema>;
