import { Request, Response, Router } from "express";
import { AuthenticatedRequest, authenticate } from "../middleware/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  createRoomSchema,
  roomIdParamSchema,
  roomMessagesQuerySchema,
  RoomMessagesQuery,
} from "../schemas/room.schema";
import {
  archiveRoom,
  createRoom,
  getRoomById,
  listActiveRooms,
  RoomError,
} from "../services/room.service";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validateBody(createRoomSchema),
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;

    try {
      const room = await createRoom(user.userId, req.body);
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof RoomError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      throw error;
    }
  }
);

router.get("/", async (_req: Request, res: Response) => {
  try {
    const rooms = await listActiveRooms();
    res.status(200).json({ rooms });
  } catch (error) {
    if (error instanceof RoomError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
});

router.get(
  "/:id",
  validateParams(roomIdParamSchema),
  validateQuery(roomMessagesQuerySchema),
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { validatedQuery } = req as Request & {
      validatedQuery: RoomMessagesQuery;
    };

    try {
      const room = await getRoomById(id, validatedQuery);
      res.status(200).json(room);
    } catch (error) {
      if (error instanceof RoomError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      throw error;
    }
  }
);

router.delete(
  "/:id",
  validateParams(roomIdParamSchema),
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params as { id: string };

    try {
      const room = await archiveRoom(id, user.userId);
      res.status(200).json(room);
    } catch (error) {
      if (error instanceof RoomError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      throw error;
    }
  }
);

export default router;
