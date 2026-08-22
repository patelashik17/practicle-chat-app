import { Router, Request, Response } from "express";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import roomRoutes from "./room.routes";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/admin", adminRoutes);

export default router;
