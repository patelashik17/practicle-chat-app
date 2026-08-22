import { Request, Response, Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getArchivalHistory } from "../services/archival.service";

const router = Router();

router.use(authenticate);

router.get("/archival-history", async (_req: Request, res: Response) => {
  const history = await getArchivalHistory();
  res.status(200).json({ history });
});

export default router;
